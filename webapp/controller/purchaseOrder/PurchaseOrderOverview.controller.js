sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PurchaseOrderController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, PurchaseOrderController, formatter, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.purchaseOrder.PurchaseOrderOverview", {
		formatter: formatter,
		
		
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("purchaseOrderOverviewRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			PurchaseOrderController.queryPurchaseOrdersByWebService(this.queryPurchaseOrdersCallback, this, true);
    	},


		/**
		 * Handles the press-event of the show details button.
		 */
		onShowDetailsPressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oSelectedPurchaseOrderModel;
			
			if(this.isPurchaseOrderSelected() == false) {
				MessageBox.error(oResourceBundle.getText("purchaseOrderOverview.noPurchaseOrderSelected"));
				return;
			}
			
			oSelectedPurchaseOrderModel = new JSONModel();
			oSelectedPurchaseOrderModel.setData(this.getSelectedPurchaseOrder());
			this.getView().setModel(oSelectedPurchaseOrderModel, "selectedPurchaseOrder");		
			
			PurchaseOrderController.openFragmentAsPopUp(this, "ERPFrontendUI5.view.purchaseOrder.PurchaseOrderOverviewDetails");
		},
		
		
		/**
		 * Handles a click at the close button of the purchase order details fragment.
		 */
		onCloseDialog : function () {
			this.byId("orderDetailsDialog").close();
		},
		
		
		/**
		 * Handles the press-event of the delete button.
		 */
		onDeletePressed : function () {
			var oResourceBundle;
			oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(this.isPurchaseOrderSelected() == false) {
				MessageBox.error(oResourceBundle.getText("purchaseOrderOverview.noPurchaseOrderSelected"));
				return;
			}
			
			PurchaseOrderController.deletePurchaseOrderByWebService(this.getSelectedPurchaseOrder(), this.deletePurchaseOrderCallback, this);
		},
		
		
		/**
		 * Handles a selection of an icon in the IconTabBar for sales order filtering.
		 */
		onFilterSelect: function (oEvent) {
			var	sKey = oEvent.getParameter("key");

			//Values for status query.
			var sOpen = "OPEN";
			var sInProcess = "IN_PROCESS";
			var sFinished = "FINISHED";
			var sCanceled = "CANCELED";

			if (sKey === "All") {
				PurchaseOrderController.queryPurchaseOrdersByWebService(this.queryPurchaseOrdersCallback, this, true);
			} else if (sKey === "Open") {
				PurchaseOrderController.queryPurchaseOrdersByWebService(this.queryPurchaseOrdersCallback, this, true, sOpen);
			} else if (sKey === "In_Process") {
				PurchaseOrderController.queryPurchaseOrdersByWebService(this.queryPurchaseOrdersCallback, this, true, sInProcess);
			} else if (sKey === "Finished") {
				PurchaseOrderController.queryPurchaseOrdersByWebService(this.queryPurchaseOrdersCallback, this, true, sFinished);
			} else if (sKey === "Canceled") {
				PurchaseOrderController.queryPurchaseOrdersByWebService(this.queryPurchaseOrdersCallback, this, true, sCanceled);
			}
		},
		
		
		/**
		 * Checks if a purchase order has been selected.
		 */
		isPurchaseOrderSelected : function () {
			if(this.getView().byId("purchaseOrderTable").getSelectedItem() == null)
				return false;
			else
				return true;
		},
		
		
		/**
		 * Gets the the selected purchase order.
		 */
		getSelectedPurchaseOrder : function () {
			var oListItem = this.getView().byId("purchaseOrderTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("purchaseOrders");
			var oSelectedPurchaseOrder = oContext.getProperty(null, oContext);
			
			return oSelectedPurchaseOrder;
		},


		/**
		 * Formatter of the purchase order detail status text.
		 */
		detailStatusTextFormatter: function(aStatus) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(aStatus == null)
				return "";

			return PurchaseOrderController.getDetailStatusText(aStatus, oResourceBundle);
		},


		/**
		 * Formatter of the purchase order total status text.
		 */
		totalStatusTextFormatter: function(aStatus) {
			return PurchaseOrderController.totalStatusTextFormatter(aStatus, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},


		/**
		 * Formatter of the purchase order total status state.
		 */
		totalStatusStateFormatter: function(aStatus) {
			return PurchaseOrderController.totalStatusStateFormatter(aStatus);
		},


		/**
		 * Callback function of the queryPurchaseOrder RESTful WebService call in the PurchaseOrderController.
		 */
		queryPurchaseOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("purchaseOrderOverview.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "purchaseOrders");
		},
		
		
		/**
		 * Callback function of the deletePurchaseOrder RESTful WebService call in the PurchaseOrderController.
		 */
		deletePurchaseOrderCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					PurchaseOrderController.queryPurchaseOrdersByWebService(oCallingController.queryPurchaseOrdersCallback, oCallingController, false);
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