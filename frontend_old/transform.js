import angular from 'angular';
import _ from 'lodash';


export function transform(rules, model, direction, Restangular) {
    const $q = angular.injector(['ng']).get('$q');

    let deferred = $q.defer();

    if(model === undefined) {
        deferred.resolve({});
        return deferred.promise;
    }

    let tModel = Restangular.copy(model);
    let promise;
    let promises =_.map(rules, (rule, fieldName) => {
        promise = $q.when(rule[direction](tModel[fieldName]));
        promise.then((value) => tModel[fieldName] = value);
        return promise;
    });
    $q
        .all(promises)
        .then(() => {
            tModel.$transformed = true;
            deferred.resolve(tModel);
        });

    return deferred.promise;
};