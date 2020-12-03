sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  	"use strict";
	return UIComponent.extend("ERPFrontendUI5.Component", {

		metadata : {
         	manifest: "json"
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
      	}
   	});
});