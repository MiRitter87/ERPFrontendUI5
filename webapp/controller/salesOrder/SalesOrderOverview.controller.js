sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./SalesOrderController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, SalesOrderController, formatter, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.salesOrder.SalesOrderOverview", {
		formatter: formatter,
		
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("salesOrderOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			SalesOrderController.querySalesOrdersByWebService(this.querySalesOrdersCallback, this, true);
    	},


		/**
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.isSalesOrderSelected() == false) {
				MessageBox.error(oResourceBundle.getText("salesOrderOverview.noSalesOrderSelected"));
				return;
			}
			
			SalesOrderController.deleteSalesOrderByWebService(this.getSelectedSalesOrder(), this.deleteSalesOrderCallback, this);
		},
		
		
		/**
		 * Handles the press-event of the show details button.
		 */
		onShowDetailsPressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oSelectedSalesOrderModel
			
			if(this.isSalesOrderSelected() == false) {
				MessageBox.error(oResourceBundle.getText("salesOrderOverview.noSalesOrderSelected"));
				return;
			}
			
			oSelectedSalesOrderModel = new JSONModel();
			oSelectedSalesOrderModel.setData(this.getSelectedSalesOrder());
			this.getView().setModel(oSelectedSalesOrderModel, "selectedSalesOrder");		
			
			SalesOrderController.openFragmentAsPopUp(this, "ERPFrontendUI5.view.salesOrder.SalesOrderOverviewDetails");
		},
		
		
		/**
		 * Handles a click at the close button of the sales order details fragment.
		 */
		onCloseDialog : function () {
			this.byId("orderDetailsDialog").close();
		},
		
		
		/**
		 * Checks if a sales order has been selected.
		 */
		isSalesOrderSelected : function () {
			if(this.getView().byId("salesOrderTable").getSelectedItem() == null)
				return false;
			else
				return true;
		},
		
		
		/**
		 * Gets the the selected sales order.
		 */
		getSelectedSalesOrder : function () {
			var oListItem = this.getView().byId("salesOrderTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("salesOrders");
			var oSelectedSalesOrder = oContext.getProperty(null, oContext);
			
			return oSelectedSalesOrder;
		},
		
		
		/**
		 * Formatter of the sales order status text.
		 */
		orderStatusTextFormatter: function(sStatus) {
			return SalesOrderController.orderStatusTextFormatter(sStatus, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Formatter of the sales order status state.
		 */
		orderStatusStateFormatter: function(sStatus) {
			return SalesOrderController.orderStatusStateFormatter(sStatus);
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
					MessageToast.show(oResourceBundle.getText("salesOrderOverview.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "salesOrders");
		},
		
		
		/**
		 * Callback function of the deleteSalesOrder RESTful WebService call in the SalesOrderController.
		 */
		deleteSalesOrderCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					SalesOrderController.querySalesOrdersByWebService(oCallingController.querySalesOrdersCallback, oCallingController, false);
				}
				
				if(oReturnData.message[0].type == 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			}
		}
	});
});