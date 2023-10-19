import _ from 'lodash';
import 'restangular';
import angular from 'angular';


export function buildClientTree(nodes) {
    let root = { id: null, name: "Root", children: [] };
    let idToNodeMap = _.reduce(nodes, (acc, val) => {
        val.children = [];
        acc[val.id] = val;
        return acc;
    }, {});
    _.each(nodes, (node) => {
        if(node.parent == undefined) {
            root.children.push(node);
        } else {
            idToNodeMap[node.parent].children.push(node);
        }
    });
    return root.children;
};


let unflatten = function( array, parent, tree, visited ){
    tree = typeof tree !== 'undefined' ? tree : [];
    parent = typeof parent !== 'undefined' ? parent : { id: 0 };
    visited = typeof visited !== 'undefined' ? visited : [];

    if(visited.indexOf(parent.id) !== -1) {
        return [];
    }

    var children = _.filter( array, function(child){ return child.parent == parent.id; });

    if( !_.isEmpty( children )  ){
        if( parent.id == 0 ){
           tree = children;   
        } else {
           parent['children'] = children;
        }
        visited.push(parent.id);
        _.each( children, function( child ){ unflatten( array, child, [], visited ) } );                    
    }
    return tree;
};


export function buildFolderedTree(folders, entities) {
    entities = _.filter(entities, (entity) => entity.id !== -1)
    let entityRoute = _.head(entities) ? _.head(entities).route : null;
    let lastId = entities.length > 0 ? _.max(_.last(folders).id, _.last(entities).id) : 0;
    lastId++;

    entities = _.map(entities, (entity) => {
        let newId = ++lastId;
        entity.originalId = entity.id;
        entity.id = newId;
        return entity;
    });

    let nodes = _.concat(folders, entities);
    nodes = _.map(nodes, (node) => {
        if(node.parent === null) {
            node.parent = 0;
        }
        return node;
    })
    let tree = unflatten(nodes);

    traverseTree(tree, (node) => {
        if(node.route === entityRoute) {
            node.id = node.originalId;
        };
        if(node.parent === 0) {
            node.parent = null;
        }
    });

    return tree;
};

export function buildProgramPlaylistsFolderedTree(folders, programs, playlists) {
    let result = {};
    _.each(folders, (folder) => {
        result[folder.id] = _.clone(folder);
        result[folder.id].children = [];
    });
    _.each(programs, (entity) => {
        result[entity.parent].children.push(entity);
        entity.children = [];
    });
    result = _.map(result);
    traverseTree(result, (entity) => {
        if(entity.route === 'program') {
            if(!entity.children) {
                entity.children = [];
            }
            _.each(playlists, (playlist) => {
                _.each(entity.playlists, (programPlaylist) => {
                    if(playlist.id === programPlaylist.playlist) {
                        entity.children.push(playlist);
                    }
                });
            });
        }
    });
    return result;
};

export function restangularFix(Restangular, object) {
    object = Restangular.restangularizeElement(
        object.parentResource,
        object,
        object.route
    );
    object = Restangular.copy(object);
    return object;
}

export function traverseTree(tree, f) {
    let continueFlag;
    _.each(tree, (child) => {
        continueFlag = f(child);
        if(continueFlag === false) {
            return false;
        }
        traverseTree(child.children, f);
    });
};


export function findNode(tree, f) {
    let foundNode;
    traverseTree(tree, (node) => {
        if(f(node)) {
            foundNode = node;
            return false;
        }
    });
    return foundNode;
};

export function filterTree(tree, f, findParentNode) {
    findParentNode = findParentNode || ((tree, node) => {
        return findNode(tree, (n) => n.id === node.parent);
    });
    let foundNodes = [];
    let resultTree;
    traverseTree(tree, (node) => {
        if(f(node)) {
            foundNodes.push(node);
        }
    });
    let resultEntities = {},
        parentNode;
    _.each(foundNodes, (node) => {
        while(node !== undefined) {
            if(resultEntities[node.route] === undefined) {
                resultEntities[node.route] = [];
            }
            resultEntities[node.route].push(node);
            parentNode = findParentNode(tree, node);
            node = parentNode;
        }
    });
    _.each(resultEntities, (entities, route) => {
        resultEntities[route] = angular.copy(_.uniqBy(entities, 'id'));
    });
    return resultEntities;
};