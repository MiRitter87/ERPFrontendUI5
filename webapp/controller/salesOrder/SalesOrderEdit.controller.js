sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./SalesOrderController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, SalesOrderController, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.salesOrder.SalesOrderEdit", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("salesOrderEditRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query sales order data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			SalesOrderController.querySalesOrdersByWebService(this.querySalesOrdersCallback, this, true);
    	},


		/**
		 * Handles the selection of an item in the sales order ComboBox.
		 */
		onSalesOrderSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oSalesOrdersModel = this.getView().getModel("salesOrders");
			var oSalesOrders = oSalesOrdersModel.oData.salesOrder;
			var oSalesOrder;
			var oSelectedOrderModel = new JSONModel();
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected sales order from the array of all sales orders according to the id.
			for(var i = 0; i < oSalesOrders.length; i++) {
    			var oTempSalesOrder = oSalesOrders[i];
    			
				if(oTempSalesOrder.id == oSelectedItem.getKey()) {
					oSalesOrder = oTempSalesOrder;
				}
			}
			
			//Set the model of the view according to the selected sales order to allow binding of the UI elements.
			oSelectedOrderModel.setData(oSalesOrder);
			this.getView().setModel(oSelectedOrderModel, "selectedSalesOrder");
		},


		/**
		 * Callback function of the queryMaterial RESTful WebService call in the MaterialController.
		 */
		querySalesOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				oCallingController.initializeDatesAsObject(oModel.oData.salesOrder);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("salesOrderEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "salesOrders");
		},
		
		
		/**
		 * The WebService provides dates as milliseconds since 01.01.1970.
	     * This function initializes the date properties as Date objects based on the given values.
		 */
		initializeDatesAsObject : function(oSalesOrders) {			
			for(var i = 0; i < oSalesOrders.length; i++) {
    			var oTempSalesOrder = oSalesOrders[i];
				var oDate;
    			
				if(oTempSalesOrder.orderDate != null) {
					oDate = new Date(oTempSalesOrder.orderDate);
					oTempSalesOrder.orderDate = oDate;					
				}
				
				if(oTempSalesOrder.requestedDeliveryDate != null) {
					oDate = new Date(oTempSalesOrder.requestedDeliveryDate);
					oTempSalesOrder.requestedDeliveryDate = oDate;					
				}
			}
		}
	});
});