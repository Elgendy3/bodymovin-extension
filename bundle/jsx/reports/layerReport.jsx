/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_layerReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var transformFactory = $.__bodymovin.bm_transformReportFactory;
    var effectsFactory = $.__bodymovin.bm_effectsReportFactory;
    var masksFactory = $.__bodymovin.bm_masksReportFactory;
    var layerStylesFactory = $.__bodymovin.bm_layerStylesReportFactory;
    var settingsHelper = $.__bodymovin.bm_settingsHelper;
    var getLayerType = $.__bodymovin.getLayerType;
    var layerTypes = $.__bodymovin.layerTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    function Layer(layer) {
        this.layer = layer;
        this.process();
    }

    generalUtils.extendPrototype(Layer, MessageClass);

    Layer.prototype.process = function() {
        this.processProperties();
        this.processTransform();
        this.processStyles();
        this.processEffects();
        this.processMasks();
    }

    Layer.prototype.processProperties = function() {
        if ((!this.layer.enabled && settingsHelper.shouldIncludeHiddenLayers()) 
            || (this.layer.guideLayer && settingsHelper.shouldIncludeGuidedLayers())) {
            this.addMessage(messageTypes.WARNING,
            [
                rendererTypes.SKOTTIE,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
            ],
            builderTypes.DISABLED_LAYER);
        }
        if (this.layer.motionBlur) {
            this.addMessage(messageTypes.WARNING,
            [
                rendererTypes.BROWSER,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
            ],
            builderTypes.MOTION_BLUR);
        }
        if (this.layer.preserveTransparency) {
            this.addMessage(messageTypes.WARNING,
            [
                rendererTypes.BROWSER,
                rendererTypes.SKOTTIE,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
            ],
            builderTypes.PRESERVE_TRANSPARENCY);
        }
        if (this.layer.threeDLayer) {
            this.addMessage(messageTypes.ERROR,
            [
                rendererTypes.SKOTTIE,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
            ],
            builderTypes.THREE_D_LAYER);
        }
        if (this.layer.threeDLayer) {
            this.addMessage(messageTypes.WARNING,
            [
                rendererTypes.BROWSER,
            ],
            builderTypes.THREE_D_LAYER);
        }
        if (this.layer.isTrackMatte) {
            var rect = this.layer.sourceRectAtTime(0, false);
            if (rect.height * rect.width >= 1000 * 1000) {
                this.addMessage(messageTypes.WARNING,
                [
                    rendererTypes.BROWSER,
                    rendererTypes.SKOTTIE,
                    rendererTypes.IOS,
                    rendererTypes.ANDROID,
                ],
                builderTypes.LARGE_MASK);
            }
        }
    }

    Layer.prototype.processTransform = function() {
        var layerType = getLayerType(this.layer);
        var isThreeD = this.layer.threeDLayer || layerType === layerTypes.camera;
        if (this.layer.transform) {
            this.transform = transformFactory(this.layer.transform, isThreeD);
        }
    }

    Layer.prototype.processEffects = function() {
        this.effects = effectsFactory(this.layer.effect || {numProperties: 0});
    }

    Layer.prototype.processMasks = function() {
        this.masks = masksFactory(this.layer.mask || {numProperties: 0});
    }

    Layer.prototype.processStyles = function() {
        this.styles = layerStylesFactory(this.layer.property('Layer Styles') || {numProperties: 0});
    }

    Layer.prototype.serialize = function() {
    	return {
            name: this.layer.name,
            index: this.layer.index,
            type: getLayerType(this.layer),
            messages: this.serializeMessages(),
            transform: this.transform ? this.transform.serialize() : undefined,
            styles: this.styles.serialize(),
            effects: this.effects.serialize(),
            masks: this.masks.serialize(),
        }
    }


    return function(layer) {
    	return new Layer(layer);
    }
    
}());