/**
 * Created by David Maser on 16/06/2017.
 */
export const Config = {
  Ajax: {
    params: ['src', 'index', 'node', 'repeat'],
    default: 'source.json',
    root: '../data/'
  },
  brackets: '{}',
  comments: '{..}',
  defaults: {
    pikl:{
      wrapper:'[pikl="true"]'
    },
    dom:{
      root:'html'
    },
    tplTag: {
      element: 'pikl',
      replacement: 'div'
    },
    domRoot: 'body'
  },
  log: {
    enabled: true,
    events: [],
    store: 'object'
  },
  DateConditions: ['day', 'month', 'year', 'hours', 'minutes', 'seconds'],
  Operators: ['=', '!=', '>', '<', '<=', '>='],
  plugins: {
    translate: true,
    encode: false
  },
  reserved: [
    {'\'': '&apos;'},
    {'\"': '&quote;'},
    {'\>': '&gt;'},
    {'\<': '&lt;'}
  ],
  targets: ['div', 'span', 'p']
};