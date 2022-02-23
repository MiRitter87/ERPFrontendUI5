sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./ProductionOrderController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, ProductionOrderController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.productionOrder.ProductionOrderDisplay", {
		formatter: formatter,
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("productionOrderDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
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
			var oProductionOrder;
			var oProductionOrderModel = new JSONModel();;
			
			if(oSelectedItem == null) {
				this.getView().setModel(oProductionOrder, "selectedProductionOrder");
				this.resetUIElements();
				return;
			}
						
			oProductionOrder = ProductionOrderController.getProductionOrderById(oSelectedItem.getKey(), oProductionOrdersModel.oData.productionOrder);
			oProductionOrderModel.setData(oProductionOrder);
			
			//Set the model of the view according to the selected production order to allow binding of the UI elements.
			this.getView().setModel(oProductionOrderModel, "selectedProductionOrder");
		},


		/**
		 * Callback function of the queryProductionOrders RESTful WebService call in the ProductionOrderController.
		 */
		queryProductionOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("productionOrderDisplay.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "productionOrders");
		},
		
		
		/**
		 * Formatter of the production order status text.
		 */
		orderStatusTextFormatter: function(sStatus) {
			return ProductionOrderController.orderStatusTextFormatter(sStatus, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Formatter of the production order status state.
		 */
		orderStatusStateFormatter: function(sStatus) {
			return ProductionOrderController.orderStatusStateFormatter(sStatus);
		},
		
		
		/**
		 * Resets the selection of the production order. No item in the ComboBox is selected afterwards.
		 */
		resetUIElements : function () {
			this.getView().byId("productionOrderComboBox").setSelectedItem(null);
			
			this.getView().byId("idText").setText("");
			this.getView().byId("orderStatus").setText("");
			
			this.getView().byId("orderDateText").setText("");
			this.getView().byId("plannedExecutionDateText").setText("");
			this.getView().byId("executionDateText").setText("");
			
			
			this.getView().byId("itemTable").destroyItems();
		},
	});
});