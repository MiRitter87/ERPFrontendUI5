sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../material/MaterialController",
	"./ProductionOrderController",
	"sap/ui/model/json/JSONModel"
], function (Controller, MaterialController, ProductionOrderController, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.productionOrder.ProductionOrderCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("productionOrderCreateRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query material data every time a user navigates to this view. 
			//This assures that changes are being displayed in the ComboBoxes.
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			
			this.initializeProductionOrderModel();
			ProductionOrderController.initializeProductionOrderItemModel(this);
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
		 * Initializes the model of the production order to which the UI controls are bound.
		 */
		initializeProductionOrderModel : function () {
			var oProductionOrderModel = new JSONModel();
			
			//Load and set order model
			oProductionOrderModel.loadData("model/productionOrder/productionOrderCreate.json");
			oProductionOrderModel.attachRequestCompleted(function() {
				//Wait for date initialization until the JSON data have been loaded. Otherwise the date would be overwritten.
				oProductionOrderModel.setProperty("/orderDate", new Date());
				oProductionOrderModel.setProperty("/plannedExecutionDate", new Date());
   			 });
			
			this.getView().setModel(oProductionOrderModel, "newProductionOrder");	
		},
	});
});