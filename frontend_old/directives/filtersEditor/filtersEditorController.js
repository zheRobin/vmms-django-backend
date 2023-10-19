import _ from 'lodash';


/* @ngInject */
const FiltersEditorController =
function($scope, Restangular, FilterData) {
    const TEXT_FIELDS = [
        'Title', 'Artist', 'Artist addition',
        'Album', 'Genre', 'Username'
    ];
    const SELECTOR_FIELDS = [
        'Language',
        'Voice',
        'Version',
        'Cast',
        'Speed',
        'Mood',
        'Energy',
        'Target age',
        'Fame',
        'Daytime',
        'Season'
    ];
    const NUMERIC_FIELDS = [
        'Year', 'BPM',
    ];
    const DATE_FIELDS = [
        'Created at',
        'Updated at'
    ];
    const BOOLEAN_FIELDS = [];

    let FILTER_FIELDS = _.union(
        TEXT_FIELDS, NUMERIC_FIELDS, BOOLEAN_FIELDS, SELECTOR_FIELDS, DATE_FIELDS
    );

    const FILTER_WORDS_TEXT = [
        'is',
        'is not',
        'contains',
        'does not contain'
    ];
    const FILTER_WORDS_NUMBER = [
        'equals to',
        'does not equal to',
        'less than',
        'greater than',
        'less than or equals to',
        'greater than or equals to'
    ];
    const FILTER_WORDS_DATE = [
        'before',
        'after'
    ];
    const FILTER_WORDS_BOOLEAN = [
        'is',
        'is not'
    ];

    FilterData
        .fetch()
        .then((data) => {
            $scope.options = data;
        });

    $scope.filterFields = FILTER_FIELDS;
    $scope.filterWords = {
        text: FILTER_WORDS_TEXT,
        number: FILTER_WORDS_NUMBER,
        boolean: FILTER_WORDS_BOOLEAN,
        date: FILTER_WORDS_DATE
    };

    $scope.createNew = () => {
        $scope.filters.push({});
    };
    $scope.remove = (filter) => {
        $scope.filters.splice(
            $scope.filters.indexOf(filter),
            1
        );
    };
    $scope.getFields = (filter) => {
        let usedFields = _.reduce($scope.filters, (acc, filter) => {acc.push(filter.field); return acc;}, []);
        let allowed = _.difference($scope.filterFields, usedFields);
        if(filter.field) {
            allowed.push(filter.field);
        }
        return allowed;
    };
    $scope.getFilterDataType = (filter) => {
        let field = filter.field;
        if(field === undefined)
            return;
        if(_.includes(TEXT_FIELDS, field)) {
            return 'text';
        } else if(_.includes(NUMERIC_FIELDS, field)) {
            return 'number';
        } else if(_.includes(BOOLEAN_FIELDS, field)) {
            return 'boolean';
        } else if(_.includes(SELECTOR_FIELDS, field)) {
            return 'selector';
        } else if(_.includes(DATE_FIELDS, field)) {
            return 'date';
        }
        console.error('Type of field ' + field + ' is unknown');
        return 'unknown';
    };

    let formatFilters = (filters) => {
        let filterType;
        filters = _.clone(filters);
        filters = _.reduce(filters, (acc, filter) => {
            filterType = $scope.getFilterDataType(filter);
            if(filterType === 'selector' || filterType === 'text' || filterType === 'number') {
                _.each(filter.values, (value) => {
                    if(filterType === 'selector') {
                        if(value.id)
                            acc.push({ field: filter.field, word: filter.word, value: value.id.toString() });
                    } else {
                        acc.push({ field: filter.field, word: filter.word, value: value.text });
                    }
                });
            } else {
                acc.push(filter);
            }
            return acc;
        }, [])
        filters.$formatted = true;
        return filters;
    };

    let parseModel = (model) => {
        model = _.clone(model);
        let optionsReady = $scope.options !== undefined,
            filterType,
            accFilter,
            value,
            isNew;
        model = _.reduce(model, (acc, filter) => {
            filterType = $scope.getFilterDataType(filter);
            if(filterType === 'selector' || filterType === 'text' || filterType === 'number') {
                isNew = false;
                accFilter = _.find(acc, (accf) => accf.field === filter.field);
                if(accFilter === undefined) {
                    accFilter = { field: filter.field, word: filter.word, values: []};
                    isNew = true;
                }
                if(filterType === 'selector') {
                    if(optionsReady) {
                        value = _.find($scope.options[filter.field], (option) => option.id === parseInt(filter.value));
                    } else {
                        value = filter.value;
                    }
                    accFilter.values.push(value);
                } else {
                    accFilter.values.push({text: filter.value});
                }
            } else {
                accFilter = filter;
            }
            if(isNew) {
                acc.push(accFilter);
            }
            return acc;
        }, []);
        model.$parsed = true;
        return model;
    };

    $scope.$watch('options', (options) => {
        if(options !== undefined) {
            _.each($scope.model, (filter) => {
                if($scope.getFilterDataType(filter) === 'selector') {
                    filter.values =_.map(filter.values, (value) => {
                        return options[filter.field][value];
                    });
                };
            })
        }
    });

    $scope.$watch('filters', (newFilters) => {
        if(newFilters === undefined)
            return;
        if(!newFilters.$parsed) {
            $scope.model = formatFilters(newFilters);
        }
        newFilters.$parsed = false;
    }, true);

    $scope.$watch('model', (newModel) => {
        if(newModel === undefined)
            return;
        if(!newModel.$formatted) {
            $scope.filters = parseModel(newModel);
        }
    });

    $scope.filterOptions = ($query, options) => {
        if($query === undefined || $query === '')
            return options;
        let rgxp = new RegExp(_.toLower($query));
        let result = _.filter(options, (option) => rgxp.test(_.toLower(option.name)));
        return result;
    };
};

export default FiltersEditorController;