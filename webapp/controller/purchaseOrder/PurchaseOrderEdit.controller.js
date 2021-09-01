sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../businessPartner/BusinessPartnerController",
	"../material/MaterialController",
	"./PurchaseOrderController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, BusinessPartnerController, MaterialController, PurchaseOrderController, JSONModel, MessageToast, MessageBox) {
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
			BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this, false, "VENDOR");
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
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
		 * Handles the selection of an item in the vendor ComboBox.
		 */
		onVendorSelectionChange : function (oControlEvent) {
			var oPurchaseOrderModel = this.getView().getModel("selectedPurchaseOrder");
			var iPartnerId = PurchaseOrderController.getSelectedPartnerId(oControlEvent);
			
			oPurchaseOrderModel.setData({vendorId: iPartnerId}, true);
		},
		
		
		/**
		 * Opens the dialog to add a new purchase order item.
		 */
		onAddItemPressed : function () {
			var oResourceBundle;
			
			if(this.byId("purchaseOrderComboBox").getSelectedKey() == "") {
				oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("purchaseOrderEdit.noOrderSelected"));
				return;
			}			
			
			PurchaseOrderController.initializePurchaseOrderItemModel(this);
			PurchaseOrderController.setIdOfNewItem(this.getView().getModel("selectedPurchaseOrder"), this);
			PurchaseOrderController.openFragmentAsPopUp(this, "ERPFrontendUI5.view.purchaseOrder.PurchaseOrderItemCreate");
		},
		
		
		/**
		 * Handles the selection of an item in the material ComboBox.
		 */
		onMaterialSelectionChange : function (oControlEvent) {
			PurchaseOrderController.onMaterialSelectionChange(oControlEvent, this,
				this.getView().getModel("newPurchaseOrderItem"),
				this.getView().getModel("materials"));
		},
		
		
		/**
		 * Handles changes of the input for purchase order item quantity.
		 */
		onQuantityChange : function () {
			if(this.getView().byId("materialComboBox").getSelectedItem() == null) {
				this.getView().setModel(null, "selectedMaterial");
				PurchaseOrderController.clearItemPopUpFields(this);
				return;
			}			
			
			PurchaseOrderController.updatePriceTotal(
				this.getView().getModel("selectedMaterial"),
				this.getView().getModel("newPurchaseOrderItem"));
		},
		
		
		/**
		 * Handles the closing by cancelation of the new item Dialog.
		 */
		onCancelDialog : function () {
			this.byId("newItemDialog").close();
			this.byId("materialComboBox").setSelectedItem(null);
		},
		
		
		/**
		 * Handles the saving of the new item Dialog.
		 */
		onSaveDialog : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oItemData = this.getView().getModel("newPurchaseOrderItem");
			var oPurchaseOrderModel = this.getView().getModel("selectedPurchaseOrder");
			var oPurchaseOrderItems = oPurchaseOrderModel.getProperty("/items");
			var itemWithMaterialExists;
			
			//Check if a material has been selected.
			if(this.getView().byId("materialComboBox").getSelectedItem() == null) {
				MessageBox.error(oResourceBundle.getText("purchaseOrderEdit.noMaterialSelected"));
				return;
			}
			
			//Do not allow adding an item with quantity 0.
			if(oItemData.oData.quantity < 1) {
				MessageBox.error(oResourceBundle.getText("purchaseOrderEdit.quantityIsZero"));
				return;
			}
			
			//Check if a purchase order item with the same material already exists.
			itemWithMaterialExists = PurchaseOrderController.isItemWithMaterialExisting(oPurchaseOrderItems, oItemData.oData.materialId);
			if(itemWithMaterialExists == true) {
				MessageBox.error(oResourceBundle.getText("purchaseOrderEdit.itemWithMaterialExists", [oItemData.oData.materialId]));
				return;
			}
			
			//Remove the binding of the UI to the selectedMaterial. 
			//Otherwhise the selectedMaterial is updated by databinding when the input fields are being cleared.
			this.getView().setModel(null, "selectedMaterial");
			
			//Add the item to the purchase order model. Then re-initialize the item model that is bound to the "new item PopUp".
			oPurchaseOrderItems.push(oItemData.oData);
			oPurchaseOrderModel.setProperty("/items", oPurchaseOrderItems);
			PurchaseOrderController.initializePurchaseOrderItemModel(this);
			
			this.byId("newItemDialog").close();
			PurchaseOrderController.clearItemPopUpFields(this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("purchaseOrderComboBox").setSelectedItem(null);
			
			this.getView().byId("idText").setText("");
			this.getView().byId("statusComboBox").setSelectedItem(null);
			
			this.getView().byId("vendorComboBox").setSelectedItem(null);
			
			this.getView().byId("orderDatePicker").setDateValue(null);
			this.getView().byId("requestedDeliveryDatePicker").setDateValue(null);	
			
			this.getView().byId("itemTable").destroyItems();
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