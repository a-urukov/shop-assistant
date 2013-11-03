/**
 * Статический класс валидации данных
 * @constructor
 */
function Validate() { }

/**
 * Проверка обязательных для заполнения полей
 * @param {String} name имя поля
 * @param value значение
 * @returns {string} ошибку валидации или пустую строку, если все ок
 */
Validate.isNotEmpty = function(name, value) {
    return value ? '' : 'Поле ' + name + ' не должно быть пустым!';
};

/**
 * Проверка числовых полей
 * @param {String} name имя поля
 * @param value значение
 * @returns {String} ошибку валидации или пустую строку, если все ок
 */
Validate.mustNumber = function(name, value) {
    return $.isNumeric(value) ? '' : 'Поле ' + name + ' должно быть числом!'
};

/**
 * Проверка компонента url
 * @param {String} name имя поля
 * @param value значение
 * @returns {String} ошибку валидации или пустую строку, если все ок
 */
Validate.mustUrlPath = function(name, value) {
    return value && (typeof value == 'string' && value.match(/^[A-Za-z-_\d]+$/)) ?
        '' :
        'Поле ' + name + ' должно содержать только латиснкие буквы!';
}
