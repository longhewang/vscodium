// Exercise the patched menu implementations without launching Electron.
// Usage: node dev/test_rt_menu_patch.cjs <patched-vscode-source>
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');
const root = process.argv[2];
assert(root, 'A patched VS Code source directory is required');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function block(source, marker) {
  const start = source.indexOf(marker);
  assert(start >= 0, `Missing method: ${marker}`);
  const open = source.indexOf('{', start + marker.length);
  let depth = 1;
  let end = open + 1;
  for (; depth && end < source.length; end++) {
    if (source[end] === '{') depth++;
    if (source[end] === '}') depth--;
  }
  assert.equal(depth, 0);
  return source.slice(start, end);
}
function compileMethod(source, marker, context) {
  return vm.runInNewContext(stripTypeScriptTypes(`class Subject { ${block(source, marker)} }; Subject`), context);
}
class SubmenuItemAction {
  constructor(id, title) { this.item = { submenu: { id }, title }; }
}
const browser = read('src/vs/workbench/browser/parts/titlebar/menubarControl.ts');
const Browser = compileMethod(browser, 'protected setupMainMenu(): void', { SubmenuItemAction });
const control = new Browser();
const submenu = (id, title) => new SubmenuItemAction(id, title);
let actions = [
  ['navigation', [submenu('api:rt.tools', 'Tools')]],
  ['', [submenu('MenubarRTMenu', { original: 'RT', value: 'RT', mnemonicTitle: '灏勭嚎杩借釜' })]],
  ['extensions', [submenu('api:model.tools', 'Tools')]]
];
let disposed = 0;
let menusCreated = [];
control.mainMenuDisposables = { clear() { disposed++; }, add(menu) { return menu; } };
control.menuService = { createMenu(id) { menusCreated.push(id.id); return { id }; } };
control.contextKeyService = {};
control.mainMenu = { getActions() { return actions; } };
control.setupMainMenu();
assert.deepEqual(Object.keys(control.topLevelTitles), ['api:rt.tools', 'RT', 'api:model.tools']);
assert.equal(control.topLevelTitles.RT, '灏勭嚎杩借釜');
assert.equal(control.topLevelTitles['api:model.tools'], 'Tools');
actions = [['', [submenu('MenubarRTMenu', { original: 'RT', value: 'RT' })]]];
control.setupMainMenu();
assert.deepEqual(Object.keys(control.menus), ['RT']);
assert.equal(disposed, 2, 'Removing an extension must dispose and remove its old top-level menu');

const native = read('src/vs/workbench/electron-browser/parts/titlebar/menubarControl.ts');
const Native = compileMethod(native, 'private getMenubarMenus(menubarData: IMenubarData): boolean', {
  getFlatContextMenuActions: groups => groups.flatMap(([, items]) => items)
});
const n = new Native();
n.getAdditionalKeybindings = () => ({});
n.populateMenuItems = (items, target) => target.items.push(...items);
n.topLevelTitles = { 'api:empty': 'Empty', RT: '灏勭嚎杩借釜' };
n.menus = { 'api:empty': { getActions: () => [] }, RT: { getActions: () => [['', [{ id: 'rt.start' }]]] } };
const data = { menus: {}, keybindings: {} };
assert.equal(n.getMenubarMenus(data), true, 'An empty extension must not block native menus');
assert.equal(data.menus['api:empty'], undefined);
assert.equal(data.menus.RT.label, '灏勭嚎杩借釜');
n.topLevelTitles = { File: 'File' };
n.menus = { File: { getActions: () => [] } };
assert.equal(n.getMenubarMenus({ menus: {}, keybindings: {} }), false, 'Keep the built-in startup guard');

class Menu { constructor() { this.items = []; } insert(i, item) { this.items.splice(i, 0, item); } }
class MenuItem { constructor(options) { Object.assign(this, options); } }
const main = read('src/vs/platform/menubar/electron-main/menubar.ts');
const Main = compileMethod(main, 'private appendContributedMenus(menubar: Menu): void', { Menu, MenuItem });
const m = new Main();
m.mnemonicLabel = label => label;
m.setMenuById = (menu, id) => menu.items.push({ id });
m.menubarMenus = {
  'api:first': { label: 'Tools', items: [{}] },
  File: { items: [{}] }, Terminal: { items: [{}] },
  RT: { label: '灏勭嚎杩借釜', items: [{}] },
  'api:second': { label: 'Tools', items: [{}] },
  'api:empty': { label: 'Empty', items: [] },
  Help: { items: [{}] }, 'api:last': { label: 'Last', items: [{}] }
};
const menu = new Menu();
const help = new MenuItem({ id: 'Help', role: 'help' });
menu.items.push(new MenuItem({ id: 'File' }), new MenuItem({ id: 'Terminal' }), help);
m.appendContributedMenus(menu);
assert.deepEqual(menu.items.map(item => item.id), ['api:first', 'File', 'Terminal', 'RT', 'api:second', 'Help', 'api:last']);
assert.equal(menu.items[3].label, '灏勭嚎杩借釜');
assert.equal(menu.items[5], help, 'Preserve native built-in menu roles');

const extension = read('src/vs/workbench/services/actions/common/menusExtensionPoint.ts');
const handlerBody = block(extension, '\nmenusExtensionPoint.setHandler(extensions =>');
const menuIds = { MenubarMainMenu: { id: 'main' }, MenubarRTMenu: { id: 'rt' }, ViewContainerTitle: {} };
const commands = new Map([['rt.start', { id: 'rt.start', title: 'Start' }]]);
let registrations = [];
const errors = [];
const handler = vm.runInNewContext(stripTypeScriptTypes(handlerBody.replace('menusExtensionPoint.setHandler(extensions =>', '(extensions =>') + ')'), {
  _menuRegistrations: { clear() { registrations = []; }, add(item) { registrations.push(item); } },
  _submenuMenuItems: new Map(),
  _apiMenusByKey: new Map([
    ['menuBar/main', { id: menuIds.MenubarMainMenu }], ['menuBar/rt', { id: menuIds.MenubarRTMenu }]
  ]),
  _submenus: new Map([['rt.tools', { id: { id: 'api:rt.tools' }, label: 'Tools' }]]),
  schema: { isValidItems: Array.isArray, isMenuItem: item => !!item.command },
  MenuRegistry: { getCommand: id => commands.get(id), appendMenuItem: (id, item) => ({ id, item }) },
  MenuId: menuIds, ContextKeyExpr: { deserialize: value => value },
  localize: (key, text) => text,
  isProposedApiEnabled: () => true
});
const collector = { error: text => errors.push(text), warn() {}, info() {} };
handler([{ collector, description: {}, value: {
  'menuBar/main': [{ command: 'rt.start' }, { submenu: 'rt.tools', group: 'navigation@7.6' }],
  'menuBar/rt': [{ command: 'rt.start', group: '1_run@10', when: 'rt.ready' }]
} }]);
assert.equal(errors.length, 1, 'Reject commands placed directly on the top-level menu bar');
assert.equal(registrations.length, 2);
assert.equal(registrations[0].item.submenu.id, 'api:rt.tools');
assert.equal(registrations[0].item.order, 7.6);
assert.equal(registrations[0].item.group, undefined, 'Top-level order shares the built-in menu row');
assert.equal(registrations[1].item.order, 10);
assert.equal(registrations[1].item.when, 'rt.ready');
handler([]);
assert.equal(registrations.length, 0, 'Removing extensions clears their menu registrations');
console.log('RT menu checks passed: groups, duplicate labels, removal, native ordering, empty menus, contributions.');
