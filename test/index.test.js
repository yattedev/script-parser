
const self = require('../src/index')
test('Parse a command tag', () => {
  expect(self.parse('[cm]'))
    .toBe([{type: 'command' , name: 'cm', args: {}}])
})

test('Parse a command tag with arguments', () => {
  expect(self.parse('[wait time=200]'))
    .toBe([{type: 'command', name: 'wait', args: {'time': 200}}])
})

test('Parse a command tag with arguments', () => {
  expect(self.parse('[image storage="bg0" page=fore layer=base]'))
    .toBe([{type: 'command', name: 'image',
      args: {'storage': 'bg0', 'page': 'fore', 'layer': 'base'}}])
})

test('Parse a label', () => {
  expect(self.parse('*start'))
    .toBe([{type: 'label', name: 'start'}])
})

test('Parse a comment', () => {
  expect(self.parse('; line comment'))
    .toBe([])
})

test('Parse text', () => {
  expect(self.parse('Hello, world!'))
    .toBe([{type: 'text', content: "Hello, world!"}])
})

test('Parse a command line', () => {
  expect(self.parse('@wait time=200'))
    .toBe([{type: 'command', name: 'wait', args: {'time': 200}}])
})

test('Parse a command line with indent', () => {
  expect(self.parse('   @cm'))
    .toBe([{type: 'command', name: 'cm', args: {}}])
})

test('Parse a command range', () => {
  expect(self.parse('<font color="blue">Hello,</font> world!'))
    .toBe([
      {type: 'command', name: 'font_start', args: {'color': 'blue'}},
      {type: 'text', content: 'Hello,'},
      {type: 'command', name: 'font_end', args: {}},
      {type: 'text', content: ' world!'}
    ])
})
