sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./SalesOrderController",
	"../material/MaterialController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, SalesOrderController, MaterialController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.salesOrder.SalesOrderDisplay", {
		formatter: formatter,
		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("salesOrderDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			SalesOrderController.querySalesOrdersByWebService(this.querySalesOrdersCallback, this, true);
			
			this.getView().setModel(null, "selectedSalesOrder");
    	},


		/**
		 * Handles the selection of an item in the sales order ComboBox.
		 */
		onSalesOrderSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oSalesOrdersModel = this.getView().getModel("salesOrders");
			var oSalesOrder;
			var oSalesOrderModel;
			
			if(oSelectedItem == null)
				return;
						
			oSalesOrder = SalesOrderController.getSalesOrderById(oSelectedItem.getKey(), oSalesOrdersModel.oData.salesOrder);
			oSalesOrderModel = new JSONModel();
			oSalesOrderModel.setData(oSalesOrder);
			
			//Set the model of the view according to the selected sales order to allow binding of the UI elements.
			this.getView().setModel(oSalesOrderModel, "selectedSalesOrder");
		},
		
		
		/**
		 * Callback function of the querySalesOrder RESTful WebService call in the SalesOrderController.
		 */
		querySalesOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("salesOrderDisplay.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "salesOrders");
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
	});
});