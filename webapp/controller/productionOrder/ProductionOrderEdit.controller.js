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
		 * Handles the selection of an item in the production order ComboBox.
		 */
		onProductionOrderSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oProductionOrdersModel = this.getView().getModel("productionOrders");
			var oProductionOrder, wsProductionOrder;
			
			if(oSelectedItem == null) {
				this.resetUIElements();				
				return;
			}
				
			oProductionOrder = ProductionOrderController.getProductionOrderById(oSelectedItem.getKey(), oProductionOrdersModel.oData.productionOrder);
			if(oProductionOrder != null)
				wsProductionOrder = this.getProductionOrderForWebService(oProductionOrder);
			
			//Set the model of the view according to the selected production order to allow binding of the UI elements.
			this.getView().setModel(wsProductionOrder, "selectedProductionOrder");
			
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
		 * Formatter of the material text in the item table. Provides the name of a material based on the given ID.
		 */
		materialNameFormatter : function(iMaterialId) {
			return MaterialController.materialNameFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Formatter of the material unit in the item table. Provides the unit of a material based on the given ID.
		 */
		materialUnitFormatter: function(iMaterialId) {
			return MaterialController.materialUnitFormatter(iMaterialId, this.getView().getModel("materials"));
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
		
		
		/**
		 * Creates a representation of a production order that can be processed by the WebService.
		 */
		getProductionOrderForWebService : function(oProductionOrder) {
			var wsProductionOrder = new JSONModel();
			var wsProductionOrderItem;
			
			//Data at head level
			wsProductionOrder.setProperty("/productionOrderId", oProductionOrder.id);
			wsProductionOrder.setProperty("/orderDate", oProductionOrder.orderDate);
			wsProductionOrder.setProperty("/plannedExecutionDate", oProductionOrder.plannedExecutionDate);
			wsProductionOrder.setProperty("/executionDate", oProductionOrder.executionDate);
			wsProductionOrder.setProperty("/status", oProductionOrder.status);
			
			//Data at item level
			wsProductionOrder.setProperty("/items", new Array());
			
			for(var i = 0; i < oProductionOrder.items.length; i++) {
				var oTempProductionOrderItem = oProductionOrder.items[i];
				
				wsProductionOrderItem = new JSONModel();
				wsProductionOrderItem.setProperty("/itemId", oTempProductionOrderItem.id);
				wsProductionOrderItem.setProperty("/materialId", oTempProductionOrderItem.material.id);
				wsProductionOrderItem.setProperty("/quantity", oTempProductionOrderItem.quantity);
				
				wsProductionOrder.oData.items.push(wsProductionOrderItem.oData);
			}
			
			return wsProductionOrder;
		},
	});
});