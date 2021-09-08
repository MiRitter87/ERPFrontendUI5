sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./PurchaseOrderController",
	"../../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, PurchaseOrderController, formatter, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.purchaseOrder.PurchaseOrderDisplay", {
		formatter: formatter,
		
			
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("purchaseOrderDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query master data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			PurchaseOrderController.queryPurchaseOrdersByWebService(this.queryPurchaseOrdersCallback, this, true);
			
			this.getView().setModel(null, "selectedPurchaseOrder");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the purchase order ComboBox.
		 */
		onPurchaseOrderSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oPurchaseOrdersModel = this.getView().getModel("purchaseOrders");
			var oPurchaseOrder;
			var oPurchaseOrderModel = new JSONModel();
			
			if(oSelectedItem == null) {
				this.getView().setModel(oPurchaseOrderModel, "selectedPurchaseOrder");
				this.resetUIElements();
				return;
			}
			
			oPurchaseOrder = PurchaseOrderController.getPurchaseOrderById(oSelectedItem.getKey(), oPurchaseOrdersModel.oData.purchaseOrder);
			oPurchaseOrderModel.setData(oPurchaseOrder);
			
			//Set the model of the view according to the selected purchase order to allow binding of the UI elements.
			this.getView().setModel(oPurchaseOrderModel, "selectedPurchaseOrder");
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("purchaseOrderComboBox").setSelectedItem(null);
			
			this.getView().byId("idText").setText("");
			this.getView().byId("totalStatus").setText("");
			this.getView().byId("totalStatus").setText("");
			
			this.getView().byId("vendorText").setText("");
			
			this.getView().byId("orderDateText").setText("");
			this.getView().byId("requestedDeliveryDateText").setText("");
			
			this.getView().byId("itemTable").destroyItems();
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
		 * Callback function of the queryPurchaseOrders RESTful WebService call in the PurchaseOrderController.
		 */
		queryPurchaseOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("purchaseOrderDisplay.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "purchaseOrders");
		}
	});
});