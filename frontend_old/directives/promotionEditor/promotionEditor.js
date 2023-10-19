import template from './promotionEditor.jade';
import controller from './PromotionEditorController.js';


export default function PromotionEditor() {
    return {
        restrict: 'E',
        template: template,
        controller: controller,
        scope: {
            promotions: '=model'
        }
    };
};
