
const self = require('../src/index')
test('Skip whitespaces', () => {
  expect(self.skipWhitespaces(" 123", 0))
    .toBe(1)
})

test('Flatten array', () => {
  const arr = [[1,2],[3],[],[4,5,[6]]]
  expect(self.flatten(arr))
    .toEqual([1,2,3,4,5,6])
})

test('Parse a word', () => {
  expect(self.parseWord("time=200", 0))
    .toEqual(["time", 4])
})

test('Parse a command tag', () => {
  expect(self.parseLine('[cm]'))
    .toEqual([{type: 'command' , name: 'cm', args: {}}])
})

test('Parse a command tag with arguments', () => {
  expect(self.parseLine('[wait time=200]'))
    .toEqual([{type: 'command', name: 'wait', args: {'time': 200}}])
})

test('Parse a command tag with arguments', () => {
  expect(self.parseLine('[image storage="bg0" page=fore layer=base]'))
    .toEqual([{type: 'command', name: 'image',
      args: {'storage': 'bg0', 'page': 'fore', 'layer': 'base'}}])
})

test('Parse a label', () => {
  expect(self.parseLine('*start'))
    .toEqual([{type: 'label', name: 'start'}])
})

test('Parse a comment', () => {
  expect(self.parseLine('; line comment'))
    .toEqual([])
})

test('Parse text', () => {
  expect(self.parseLine('Hello, world!'))
    .toEqual([{type: 'text', content: "Hello, world!"}])
})

test('Parse a command line', () => {
  expect(self.parseLine('@wait time=200'))
    .toEqual([{type: 'command', name: 'wait', args: {'time': 200}}])
})

test('Parse a command line with indent', () => {
  expect(self.parseLine('   @cm'))
    .toEqual([{type: 'command', name: 'cm', args: {}}])
})

test('Parse a command range', () => {
  expect(self.parseLine('<font color="blue">Hello,</font> world!'))
    .toEqual([
      {type: 'command', name: 'font_start', args: {'color': 'blue'}},
      {type: 'text', content: 'Hello,'},
      {type: 'command', name: 'font_end', args: {}},
      {type: 'text', content: ' world!'}
    ])
})

test('Parse a complex line', () => {
  expect(self.parseLine('Click and new line[l][r]'))
    .toEqual([
      {type: 'text', content: 'Click and new line'},
      {type: 'command', name: 'l', args: {}},
      {type: 'command', name: 'r', args: {}}
    ])
})

test('Parse multiple lines', () => {
  expect(self.parse(`
<strong>
Hello, world![p]
</strong>
`))
  .toEqual([
    {result: {type: 'command', name: 'strong_start', args: {}}, row: 1},
    {result: {type: 'text', content: 'Hello, world!'}, row: 2},
    {result: {type: 'command', name: 'p', args: {}}, row: 2},
    {result: {type: 'command', name: 'strong_end', args: {}}, row: 3}
  ])
})
