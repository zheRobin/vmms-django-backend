import template from './promotionAutocomplete.jade';
import controller from './PromotionAutocompleteController.js';


export default function PromotionAutocomplete() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            model: '='
        }
    };
};
