sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"./MaterialController"
], function (Controller, MessageToast, JSONModel, MaterialController) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.material.MaterialDisplay", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("materialDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function (oEvent) {
			//Query material data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this);
			this.getView().byId("materialComboBox").setSelectedItem(null);
    	},
		
		
		/**
		 * Handles the selection of an item in the material ComboBox.
		 */
		onMaterialSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oModel = this.getView().getModel();
			var oMaterials = oModel.oData.materials;
			var oMaterial;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected material from the array of all materials according to the id.
			for(var i = 0; i < oMaterials.data.material.length; i++) {
    			var oTempMaterial = oMaterials.data.material[i];
    			
				if(oTempMaterial.id == oSelectedItem.getKey()) {
					oMaterial = oTempMaterial;
				}
			}
			
			//Set the model of the view according to the selected material to allow binding of the UI elements.
			oModel.setData({selectedMaterial : oMaterial}, true);
		},
		
		
		/**
		 * Callback function of the queryMaterial RESTful WebService call in the MaterialController.
		 */
		queryMaterialsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			oModel.setData({materials : oReturnData});
			
			if(oReturnData.data != null) {
				MessageToast.show(oResourceBundle.getText("materialDisplay.dataLoaded"));
			}
			else {
				if(oReturnData.message != null)
					MessageToast.show(oReturnData.message[0].text);
			}

			oCallingController.getView().setModel(oModel);
		}
	});
});