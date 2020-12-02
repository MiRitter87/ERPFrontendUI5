sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.App", {
		onInit : function() {
			this.oModel = new JSONModel();
			this.oModel.loadData("model/model.json");
			this.getView().setModel(this.oModel);
		}
	});

});