const test  = require('tape')
const sinon = require('sinon')

const helpers   = require('../test/helpers')
const bindFunc  = helpers.bindFunc
const noop      = helpers.noop

const identity      = require('../combinators/identity')
const composeB      = require('../combinators/composeB')
const reverseApply  = require('../combinators/reverseApply')

const Identity = require('./Identity')

test('Identity', t => {
  const m = Identity(0)

  t.equal(typeof Identity, 'function', 'is a function')
  t.equal(m.toString(), '[object Object]', 'returns an object')

  t.equal(typeof Identity.of, 'function', 'Identity provides an of function')

  t.equal(typeof m.value, 'function', 'provides a value function')
  t.equal(typeof m.type, 'function', 'provides a type function')

  t.throws(Identity, TypeError, 'throws when no parameters are passed')

  t.end()
})

test('Identity type', t => {
  t.equal(Identity(0).type(), 'Identity', 'type returns Identity')
  t.end()
})

test('Identity value', t => {
  const x = 'some value'
  t.equal(Identity(x).value(), x,'value returns the wrapped value' )

  t.end()
})

test('Identity equals functionality', t => {
  const a = Identity(0)
  const b = Identity(0)
  const c = Identity(1)

  const value       = 0
  const nonIdentity = { type: 'Identity...Not' }

  t.equals(a.equals(c), false, 'returns false when 2 Identities are not equal')
  t.equals(a.equals(b), true, 'returns true when 2 Identities are equal')
  t.equals(a.equals(value), false, 'returns false when passed a simple value')
  t.equals(a.equals(nonIdentity), false, 'returns false when passed a non-Identity')

  t.end()
})

test('Identity equal properties (Setoid)', t => {
  const a = Identity(0)
  const b = Identity(0)
  const c = Identity(1)
  const d = Identity(0)

  t.equals(typeof Identity(0).equals, 'function', 'provides an equals function')
  t.equals(a.equals(a), true, 'reflexivity')
  t.equals(a.equals(b), b.equals(a), 'symmetry (equal)')
  t.equals(a.equals(c), c.equals(a), 'symmetry (!equal)')
  t.equals(a.equals(b) && b.equals(d), a.equals(d), 'transitivity')

  t.end()
})

test('Identity map errors', t => {
  const map = bindFunc(Identity(0).map)

  t.throws(map(undefined), TypeError, 'throws when passed undefined')
  t.throws(map(null), TypeError, 'throws when passed null')
  t.throws(map(0), TypeError, 'throws when passed falsey number')
  t.throws(map(1), TypeError, 'throws when passed truthy number')
  t.throws(map(''), TypeError, 'throws when passed falsey string')
  t.throws(map('string'), TypeError, 'throws when passed truthy string')
  t.throws(map(false), TypeError, 'throws when passed false')
  t.throws(map(true), TypeError, 'throws when passed true')
  t.throws(map([]), TypeError, 'throws when passed an array')
  t.throws(map({}), TypeError, 'throws when passed an object')
  t.doesNotThrow(map(noop))

  t.end()
})

test('Identity map functionality', t => {
  const spy = sinon.spy(identity)
  const x   = 42

  const m = Identity(x).map(spy)

  t.equal(m.type(), 'Identity', 'returns an Identity')
  t.equal(spy.called, true, 'calls mapping function')
  t.equal(m.value(), x, 'returns the result of the map inside of new Identity')

  t.end()
})

test('Identity map properties (Functor)', t => {
  const m = Identity(49)

  const f = x => x + 54
  const g = x => x * 4

  t.equal(typeof m.map, 'function', 'provides a map function')

  t.equal(m.map(identity).value(), m.value(), 'identity')
  t.equal(m.map(composeB(f, g)).value(), m.map(g).map(f).value(), 'composition')

  t.end()
})

test('Identity ap errors', t => {
  const m   = { type: () => 'Identity...Not' }

  t.throws(Identity(undefined).ap.bind(null, Identity(0)), TypeError, 'throws when wrapped value is undefined')
  t.throws(Identity(null).ap.bind(null, Identity(0)), TypeError, 'throws when wrapped value is null')
  t.throws(Identity(0).ap.bind(null, Identity(0)), TypeError, 'throws when wrapped value is a falsey number')
  t.throws(Identity(1).ap.bind(null, Identity(0)), TypeError, 'throws when wrapped value is a truthy number')
  t.throws(Identity('').ap.bind(null, Identity(0)), TypeError, 'throws when wrapped value is a falsey string')
  t.throws(Identity('string').ap.bind(null, Identity(0)), TypeError, 'throws when wrapped value is a truthy string')
  t.throws(Identity(false).ap.bind(null, Identity(0)), TypeError, 'throws when wrapped value is false')
  t.throws(Identity(true).ap.bind(null, Identity(0)), TypeError, 'throws when wrapped value is true')
  t.throws(Identity([]).ap.bind(null, Identity(0)), TypeError, 'throws when wrapped value is an array')
  t.throws(Identity({}).ap.bind(null, Identity(0)), TypeError, 'throws when wrapped value is an object')

  t.throws(Identity(noop).ap.bind(null, undefined), TypeError, 'throws when passed undefined')
  t.throws(Identity(noop).ap.bind(null, null), TypeError, 'throws when passed null')
  t.throws(Identity(noop).ap.bind(null, 0), TypeError, 'throws when passed a falsey number')
  t.throws(Identity(noop).ap.bind(null, 1), TypeError, 'throws when passed a truthy number')
  t.throws(Identity(noop).ap.bind(null, ''), TypeError, 'throws when passed a falsey string')
  t.throws(Identity(noop).ap.bind(null, 'string'), TypeError, 'throws when passed a truthy string')
  t.throws(Identity(noop).ap.bind(null, false), TypeError, 'throws when passed false')
  t.throws(Identity(noop).ap.bind(null, true), TypeError, 'throws when passed true')
  t.throws(Identity(noop).ap.bind(null, []), TypeError, 'throws when passed an array')
  t.throws(Identity(noop).ap.bind(null, {}), TypeError, 'throws when passed an object')

  t.throws(Identity(noop).ap.bind(null, m), TypeError, 'throws when container types differ')

  t.end()
})

test('Identity ap properties (Apply)', t => {
  const m = Identity(identity)

  const a = m.map(composeB).ap(m).ap(m)
  const b = m.ap(m.ap(m))

  t.equal(typeof Identity(0).map, 'function', 'implements the Functor spec')
  t.equal(typeof Identity(0).ap, 'function', 'provides an ap function')

  t.equal(a.ap(Identity(3)).value(), b.ap(Identity(3)).value(), 'composition')

  t.end()
})

test('Identity of', t => {
  t.equal(Identity.of, Identity(0).of, 'Identity.of is the same as the instance version')
  t.equal(Identity.of(0).type(), 'Identity', 'returns an Identity')
  t.equal(Identity.of(0).value(), 0, 'wraps the value passed into an Identity')

  t.end()
})

test('Identity of properties (Applicative)', t => {
  const m = Identity(identity)

  t.equal(typeof Identity(0).of, 'function', 'provides an of function')
  t.equal(typeof Identity(0).ap, 'function', 'implements the Apply spec')

  t.equal(m.ap(Identity(3)).value(), 3, 'identity')
  t.equal(m.ap(Identity.of(3)).value(), Identity.of(identity(3)).value(), 'homomorphism')

  const a = x => m.ap(Identity.of(x))
  const b = x => Identity.of(reverseApply(x)).ap(m)

  t.equal(a(3).value(), b(3).value(), 'interchange')

  t.end()
})

test('Identity chain errors', t => {
  const chain = bindFunc(Identity(0).chain)

  t.throws(chain(undefined), TypeError, 'throws when passed undefined')
  t.throws(chain(null), TypeError, 'throws when passed null')
  t.throws(chain(0), TypeError, 'throws when passed a falsey number')
  t.throws(chain(1), TypeError, 'throws when passed a truthy number')
  t.throws(chain(''), TypeError, 'throws when passed a falsey string')
  t.throws(chain('string'), TypeError, 'throws when passed a truthy string')
  t.throws(chain(false), TypeError, 'throws when passed false')
  t.throws(chain(true), TypeError, 'throws when passed true')
  t.throws(chain(null), TypeError, 'throws when passed null')
  t.throws(chain(undefined), TypeError, 'throws when passed undefined')
  t.throws(chain([]), TypeError, 'throws when passed an array')
  t.throws(chain({}), TypeError, 'throws when passed an object')
  t.doesNotThrow(chain(noop), 'does not throw when passed a function')

  t.end()
})

test('Identity chain properties (Chain)', t => {
  t.equal(typeof Identity(0).chain, 'function', 'provides a chain function')
  t.equal(typeof Identity(0).ap, 'function', 'implements the Apply spec')

  const f = x => Identity(x + 2)
  const g = x => Identity(x + 10)

  const a = x => Identity(x).chain(f).chain(g)
  const b = x => Identity(x).chain(y => f(y).chain(g))

  t.equal(a(10).value(), b(10).value(), 'assosiativity')

  t.end()
})

test('Identity chain properties (Monad)', t => {
  t.equal(typeof Identity(0).chain, 'function', 'implements the Chain spec')
  t.equal(typeof Identity(0).of, 'function', 'implements the Applicative spec')

  const f = x => Identity(x)

  t.equal(Identity.of(3).chain(f).value(), f(3).value(), 'left identity')

  const m = x => Identity(x)

  t.equal(m(3).chain(Identity.of).value(), m(3).value(), 'right identity')

  t.end()
})