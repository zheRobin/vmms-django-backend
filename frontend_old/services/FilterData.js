/* @ngInject */
function FilterData($q, Restangular) {
    let fetchingInProgress,
        fetchPromise,
        cachedData;
    this.fetch = () => {
        if(fetchingInProgress && cachedData === undefined) {
            return fetchPromise;
        }
        let deferred = $q.defer();
        fetchPromise = deferred.promise;
        if(cachedData !== undefined) {
            deferred.resolve(cachedData);
            return fetchPromise;
        }
        fetchingInProgress = true;
        Restangular
            .all('filter')
            .customGET('data')
            .then(
                (data) => {
                    cachedData = data;
                    fetchingInProgress = false;
                    deferred.resolve(data);
                },
                () => {
                    fetchingInProgress = false;
                    deferred.reject();
                }
            );
        return fetchPromise;
    };
};

export default FilterData;