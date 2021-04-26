sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./SalesOrderController",
	"../businessPartner/BusinessPartnerController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, SalesOrderController, BusinessPartnerController, JSONModel, MessageToast) {
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
			//Query sales order and business partner data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this);
			SalesOrderController.querySalesOrdersByWebService(this.querySalesOrdersCallback, this, true);
    	},


		/**
		 * Handles the selection of an item in the sales order ComboBox.
		 */
		onSalesOrderSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oSalesOrdersModel = this.getView().getModel("salesOrders");
			var oSalesOrders = oSalesOrdersModel.oData.salesOrder;
			var wsSalesOrder;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected sales order from the array of all sales orders according to the id.
			for(var i = 0; i < oSalesOrders.length; i++) {
    			var oTempSalesOrder = oSalesOrders[i];
    			
				if(oTempSalesOrder.id == oSelectedItem.getKey()) {
					wsSalesOrder = this.getSalesOrderForWebService(oTempSalesOrder);
				}
			}
			
			//Set the model of the view according to the selected sales order to allow binding of the UI elements.
			this.getView().setModel(wsSalesOrder, "selectedSalesOrder");
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
		 * Callback function of the queryBusinessPartners RESTful WebService call in the BusinessPartnerController.
		 */
		queryBusinessPartnersCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);				
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "businessPartners");
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
		},
		
		
		/**
		 * Creates a representation of a sales order that can be processed by the WebService.
		 */
		getSalesOrderForWebService : function(oSalesOrder) {
			var wsSalesOrder = new JSONModel();
			var wsSalesOrderItem;
			
			//Data at head level
			wsSalesOrder.setProperty("/id", oSalesOrder.id);
			wsSalesOrder.setProperty("/soldToId", oSalesOrder.soldToParty.id);
			wsSalesOrder.setProperty("/shipToId", oSalesOrder.shipToParty.id);
			wsSalesOrder.setProperty("/billToId", oSalesOrder.billToParty.id);
			wsSalesOrder.setProperty("/orderDate", oSalesOrder.orderDate);
			wsSalesOrder.setProperty("/requestedDeliveryDate", oSalesOrder.requestedDeliveryDate);
			
			//Data at item level
			wsSalesOrder.setProperty("/items", new Array());
			
			for(var i = 0; i < oSalesOrder.items.length; i++) {
				var oTempSalesOrderItem = oSalesOrder.items[i];
				
				wsSalesOrderItem = new JSONModel();
				wsSalesOrderItem.setProperty("/itemId", oTempSalesOrderItem.id);
				wsSalesOrderItem.setProperty("/materialId", oTempSalesOrderItem.material.id);
				wsSalesOrderItem.setProperty("/quantity", oTempSalesOrderItem.quantity);
				wsSalesOrderItem.setProperty("/priceTotal", oTempSalesOrderItem.priceTotal);
				
				wsSalesOrder.oData.items.push(wsSalesOrderItem);
			}
			
			return wsSalesOrder;
		}
	});
});