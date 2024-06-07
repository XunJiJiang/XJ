// @ts-check
import figlet from 'figlet';
import chalk from 'chalk';
import gradient from 'gradient-string';

/**
 * @typedef CslLog
 * @type {Function}
 * @param {...any} msgs
 */

/**
 * @typedef CslTitle
 * @type {Function}
 * @param {string} title
 * @param {string | Array} colors
 */

/**
 * @typedef CslType
 * @type {Function}
 * @param {string} message
 */

/**
 * @typedef CslColor
 * @type {Function}
 * @param {string} message
 * @param {string | Array} colors
 */

/**
 * @typedef CslCreateColor
 * @type {Function}
 * @param {string | Array} colors
 * @returns {CslType}
 */

/**
 * 控制台输出
 * @param  {...any} msgs
 */
function csl(...msgs) {
  csl.log(...msgs);
}

/**
 * 控制台输出
 * @param {...any} msgs
 */
csl.log = (...msgs) => {
  console.log(...msgs);
};

/**
 * 创建颜色
 * @param {string | Array} colors
 * @returns {CslType}
 */
csl.createColor = colors => {
  if (typeof colors === 'string') {
    return chalk[colors];
  } else if (Array.isArray(colors)) {
    return gradient(colors);
  } else {
    return gradient([
      { color: 'cyan', pos: 0 },
      { color: 'pink', pos: 0.9 },
    ]);
  }
};

/**
 * 控制台输出标题
 * @param {string} title
 * @param {string | Array} colors
 */
csl.title = (title = 'Hello World', colors) => {
  const titleGradient = csl.createColor(colors);
  const msg = figlet.textSync(title);
  csl(titleGradient(msg));
};

// 对勾图标： \u2714
// 叉号图标： \u2718
// 警告图标： \u26A0
// 信息图标： \u2139
// 问号图标： \u2753
// 叹号图标： \u2757

csl.error = (message = 'Hello World', ...msgs) => {
  csl(chalk.red('\u2718 ', message, ...msgs));
};

csl.warn = (message = 'Hello World', ...msgs) => {
  csl(chalk.yellow('! ', message, ...msgs));
};

csl.info = (message = 'Hello World', ...msgs) => {
  csl(chalk.cyan('\u2170 ', message, ...msgs));
};

csl.success = (message = 'Hello World', ...msgs) => {
  csl(chalk.green('\u2713 ', message, ...msgs));
};

/**
 *
 * @param {any} message
 * @param {string | Array} colors
 * @returns
 */
csl.color = (message, colors) => {
  const color = csl.createColor(colors);
  csl(color(message));
};

/**
 * _csl上的公共方法
 */
const cslFunc = [
  'log',
  'title',
  'error',
  'warn',
  'info',
  'success',
  'color',
  'createColor',
];

/** @typedef {import('chalk').ChalkInstance} ChalkInstance */
/** @typedef {import('chalk').ColorName} ColorName */
/** @typedef {Object.<ColorName, () => string>} CreateColor */

/**
 * 控制台输出
 * @param  {...any} msgs
 * @type {{
 *  log: CslLog;
 *  title: CslTitle;
 *  error: CslType;
 *  warn: CslType;
 *  info: CslType;
 *  success: CslType;
 *  color: CslColor;
 *  createColor: CslCreateColor;
 * } & CreateColor & ChalkInstance}
 */
const _csl = (() => {
  /**
   * @type {ChalkInstance}
   */
  return new Proxy(csl, {
    apply(target, thisArg, args) {
      return target(...args);
    },
    get(target, prop, receiver) {
      if (typeof prop === 'symbol') {
        // symbol属性. 返回 target[prop]
        return target[prop];
      }

      if (cslFunc.includes(prop)) {
        // target[prop] 存在. 返回 target[prop]
        return target[prop];
      } else if (chalk[prop]) {
        // chalk[prop] 存在. 返回一个调用了chalk[prop]的函数
        /**
         * @param  {string[]} args
         */
        return (...args) => target(chalk[prop](...args));
      } else if (
        prop.startsWith('create') &&
        chalk[prop.slice(6).toLowerCase()]
      ) {
        // chalk[prop] 存在. 返回一个调用了chalk[prop]的函数
        return chalk[prop.slice(6).toLowerCase()];
      } else {
        // 其他情况. 返回 target
        return target;
      }
    },
  });
})();

export default _csl;
