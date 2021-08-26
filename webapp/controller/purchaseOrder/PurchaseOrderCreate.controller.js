sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../businessPartner/BusinessPartnerController",
	"./PurchaseOrderController",
	"sap/ui/model/json/JSONModel"
], function (Controller, BusinessPartnerController, PurchaseOrderController, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.purchaseOrder.PurchaseOrderCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter;
			
			oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("purchaseOrderCreateRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query business partner and material data every time a user navigates to this view. This assures that changes are being displayed in the ComboBoxes.
			BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this, false, "VENDOR");
			
			this.initializePurchaseOrderModel();
			PurchaseOrderController.initializePurchaseOrderItemModel(this);
    	},


		/**
		 * Handles the selection of an item in the vendor ComboBox.
		 */
		onVendorSelectionChange : function (oControlEvent) {
			var oPurchaseOrderModel = this.getView().getModel("newPurchaseOrder");
			var iPartnerId = PurchaseOrderController.getSelectedPartnerId(oControlEvent);
			
			oPurchaseOrderModel.setData({vendorId: iPartnerId}, true);
		},
		
		
		/**
		 * Opens the dialog to add a new purchase order item.
		 */
		onAddItemPressed : function () {
			PurchaseOrderController.setIdOfNewItem(this.getView().getModel("newPurchaseOrder"), this.getView().getModel("newPurchaseOrderItem"));
			PurchaseOrderController.openFragmentAsPopUp(this, "ERPFrontendUI5.view.purchaseOrder.PurchaseOrderItemCreate");
		},
		
		
		/**
		 * Handles the closing by cancelation of the new item Dialog.
		 */
		onCancelDialog : function () {
			this.byId("newItemDialog").close();
			this.byId("materialComboBox").setSelectedItem(null);
			PurchaseOrderController.initializePurchaseOrderItemModel(this);	
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var oPurchaseOrderModel = this.getView().getModel("newPurchaseOrder");
			alert(oPurchaseOrderModel.getProperty("/vendorId"));
		},


		/**
		 * Initializes the model of the purchase order to which the UI controls are bound.
		 */
		initializePurchaseOrderModel : function () {
			var oPurchaseOrderModel = new JSONModel();
			
			//Load and set order model
			oPurchaseOrderModel.loadData("model/purchaseOrder/purchaseOrderCreate.json");
			oPurchaseOrderModel.attachRequestCompleted(function() {
				//Wait for date initialization until the JSON data have been loaded. Otherwise the date would be overwritten.
				oPurchaseOrderModel.setProperty("/orderDate", new Date());
				oPurchaseOrderModel.setProperty("/requestedDeliveryDate", new Date());
   			 });
			
			this.getView().setModel(oPurchaseOrderModel, "newPurchaseOrder");	
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
		}
	});
});