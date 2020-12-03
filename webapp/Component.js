sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function (UIComponent, JSONModel, ResourceModel) {
  	"use strict";
	return UIComponent.extend("ERPFrontendUI5.Component", {

		metadata : {
         	rootView: {
            "viewName": "ERPFrontendUI5.view.App",
            "type": "XML",
            "async": true,
            "id": "app"
         	}
      	},	

		/**
		 * Initializes the component.
		 */
      	init : function () {
        	//call the init function of the parent
        	UIComponent.prototype.init.apply(this, arguments);

			//set data model
			var oModel = new JSONModel();
			oModel.loadData("model/model.json");
			this.setModel(oModel);

			//set i18n model
         	var i18nModel = new ResourceModel({
            	bundleName: "ERPFrontendUI5.i18n.i18n",
            	supportedLocales: ["de", "en"],
            	fallbackLocale: "de"
         	});
         	this.setModel(i18nModel, "i18n");
      	}
   	});
});