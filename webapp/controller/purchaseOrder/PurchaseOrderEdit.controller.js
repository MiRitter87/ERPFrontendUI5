sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../material/MaterialController",
	"./PurchaseOrderController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, MaterialController, PurchaseOrderController, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.purchaseOrder.PurchaseOrderEdit", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("purchaseOrderEditRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query purchase order, material and business partner data every time a user navigates to this view. 
			//This assures that changes are being displayed in the ComboBox.
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			PurchaseOrderController.queryPurchaseOrdersByWebService(this.queryPurchaseOrdersCallback, this, true);
		},
		
		
		/**
		 * Handles the selection of an item in the purchase order ComboBox.
		 */
		onPurchaseOrderSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oPurchaseOrdersModel = this.getView().getModel("purchaseOrders");
			var oPurchaseOrder, wsPurchaseOrder;
			
			if(oSelectedItem == null)
				return;
				
			oPurchaseOrder = PurchaseOrderController.getPurchaseOrderById(oSelectedItem.getKey(), oPurchaseOrdersModel.oData.purchaseOrder);
			if(oPurchaseOrder != null)
				wsPurchaseOrder = this.getPurchaseOrderForWebService(oPurchaseOrder);
			
			//Set the model of the view according to the selected purchase order to allow binding of the UI elements.
			this.getView().setModel(wsPurchaseOrder, "selectedPurchaseOrder");
		},
		
		
		/**
		 * Formatter of the material currency in the item table. Provides the currency of a material based on the given ID.
		 */
		materialCurrencyFormatter: function(iMaterialId) {
			return PurchaseOrderController.materialCurrencyFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Formatter of the material text in the item table. Provides the name of a material based on the given ID.
		 */
		materialNameFormatter : function(iMaterialId) {
			return PurchaseOrderController.materialNameFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Formatter of the material unit in the item table. Provides the unit of a material based on the given ID.
		 */
		materialUnitFormatter: function(iMaterialId) {
			return PurchaseOrderController.materialUnitFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Creates a representation of a purchase order that can be processed by the WebService.
		 */
		getPurchaseOrderForWebService : function(oPurchaseOrder) {
			var wsPurchaseOrder = new JSONModel();
			var wsPurchaseOrderItem;
			
			//Data at head level
			wsPurchaseOrder.setProperty("/purchaseOrderId", oPurchaseOrder.id);
			wsPurchaseOrder.setProperty("/vendorId", oPurchaseOrder.vendor.id);
			wsPurchaseOrder.setProperty("/orderDate", oPurchaseOrder.orderDate);
			wsPurchaseOrder.setProperty("/requestedDeliveryDate", oPurchaseOrder.requestedDeliveryDate);
			wsPurchaseOrder.setProperty("/status", oPurchaseOrder.status);
			
			//Data at item level
			wsPurchaseOrder.setProperty("/items", new Array());
			
			for(var i = 0; i < oPurchaseOrder.items.length; i++) {
				var oTempPurchaseOrderItem = oPurchaseOrder.items[i];
				
				wsPurchaseOrderItem = new JSONModel();
				wsPurchaseOrderItem.setProperty("/itemId", oTempPurchaseOrderItem.id);
				wsPurchaseOrderItem.setProperty("/materialId", oTempPurchaseOrderItem.material.id);
				wsPurchaseOrderItem.setProperty("/quantity", oTempPurchaseOrderItem.quantity);
				wsPurchaseOrderItem.setProperty("/priceTotal", oTempPurchaseOrderItem.priceTotal);
				
				wsPurchaseOrder.oData.items.push(wsPurchaseOrderItem.oData);
			}
			
			return wsPurchaseOrder;
		},
		
		
		/**
		 * Callback function of the queryPurchaseOrders RESTful WebService call in the PurchaseOrderController.
		 */
		queryPurchaseOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				PurchaseOrderController.initializeDatesAsObject(oModel.oData.purchaseOrder);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("purchaseOrderEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "purchaseOrders");
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
		}
	});
});