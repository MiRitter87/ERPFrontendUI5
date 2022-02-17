sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ProductionOrderController",
	"../material/MaterialController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, ProductionOrderController, MaterialController, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.productionOrder.ProductionOrderEdit", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("productionOrderEditRoute").attachMatched(this._onRouteMatched, this);
			
			ProductionOrderController.initializeStatusComboBox(this.getView().byId("statusComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query Production order and material data every time a user navigates to this view. 
			//This assures that changes are being displayed in the ComboBox.
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			ProductionOrderController.queryProductionOrdersByWebService(this.queryProductionOrdersCallback, this, true);
			
			this.getView().setModel(null, "selectedProductionOrder");
			this.resetUIElements();
    	},


		/**
		 * Callback function of the queryMaterialsByWebService RESTful WebService call in the MaterialController.
		 */
		queryMaterialsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "materials");
		},
		
		
		/**
		 * Callback function of the queryProductionOrders RESTful WebService call in the ProductionOrderController.
		 */
		queryProductionOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				ProductionOrderController.initializeDatesAsObject(oModel.oData.productionOrder);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("productionOrderEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "productionOrders");
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("productionOrderComboBox").setSelectedItem(null);
			
			this.getView().byId("idText").setText("");
			this.getView().byId("statusComboBox").setSelectedItem(null);
			
			this.getView().byId("orderDatePicker").setDateValue(null);
			this.getView().byId("plannedExecutionDatePicker").setDateValue(null);
			this.getView().byId("executionDatePicker").setDateValue(null);
			
			this.getView().byId("itemTable").destroyItems();
		},
	});
});