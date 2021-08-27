sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../businessPartner/BusinessPartnerController",
	"../material/MaterialController",
	"./PurchaseOrderController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, BusinessPartnerController, MaterialController, PurchaseOrderController, JSONModel, MessageBox) {
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
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			
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
		 * Handles the deletion of an item.
		 */
		onDeleteItemPressed : function () {
			var oSelectedItem, oResourceBundle;
			
			//Check if an item has been selected.
			oSelectedItem = this.getView().byId("itemTable").getSelectedItem();
			if(oSelectedItem == null) {
				oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("purchaseOrderCreate.noItemSelected"));
				return;
			}
			
			this.deleteItemFromOrderModel(this.getSelectedItem());
			this.updateItemIds();
			this.updateItemTable();
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
			PurchaseOrderController.updatePriceTotal(
				this.getView().getModel("selectedMaterial"),
				this.getView().getModel("newPurchaseOrderItem"));
		},
		
		
		/**
		 * Handles the saving of the new item Dialog.
		 */
		onSaveDialog : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oItemData = this.getView().getModel("newPurchaseOrderItem");
			var oPurchaseOrderModel = this.getView().getModel("newPurchaseOrder");
			var oPurchaseOrderItems = oPurchaseOrderModel.getProperty("/items");
			var itemWithMaterialExists;
			
			//Check if a material has been selected.
			if(this.getView().byId("materialComboBox").getSelectedItem() == null) {
				MessageBox.error(oResourceBundle.getText("purchaseOrderCreate.noMaterialSelected"));
				return;
			}
			
			//Do not allow adding an item with quantity 0.
			if(oItemData.oData.quantity < 1) {
				MessageBox.error(oResourceBundle.getText("purchaseOrderCreate.quantityIsZero"));
				return;
			}
			
			//Check if a purchase order item with the same material already exists.
			itemWithMaterialExists = PurchaseOrderController.isItemWithMaterialExisting(oPurchaseOrderItems, oItemData.oData.materialId);
			if(itemWithMaterialExists == true) {
				MessageBox.error(oResourceBundle.getText("purchaseOrderCreate.itemWithMaterialExists", [oItemData.oData.materialId]));
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
		 * Handles the closing by cancelation of the new item Dialog.
		 */
		onCancelDialog : function () {
			this.byId("newItemDialog").close();
			PurchaseOrderController.clearItemPopUpFields(this);
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
		 * Gets the the selected purchase order item.
		 */
		getSelectedItem : function () {
			var oListItem = this.getView().byId("itemTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("newPurchaseOrder");
			var oSelectedItem = oContext.getProperty(null, oContext);
			
			return oSelectedItem;
		},
		
		
		/**
		 * Deletes the given item from the purchase order model.
		 */
		deleteItemFromOrderModel : function(oPurchaseOrderItem) {
			var oPurchaseOrderModel, oPurchaseOrderItems;
			
			oPurchaseOrderModel = this.getView().getModel("newPurchaseOrder");
			oPurchaseOrderItems = oPurchaseOrderModel.getProperty("/items");
			
			for(var i = 0; i < oPurchaseOrderItems.length; i++) {
    			var oTempItem = oPurchaseOrderItems[i];
    			
				if(oTempItem.itemId == oPurchaseOrderItem.itemId) {
					oPurchaseOrderItems.splice(i, 1);
				}
			}
		},
		
		
		/**
		 * Updates the IDs of the purchase order items incrementally.
	     * The item IDs range from 1 to n, where n is the number of items.
		 */
		updateItemIds : function() {
			var oPurchaseOrderItems, oPurchaseOrderModel;

			oPurchaseOrderModel = this.getView().getModel("newPurchaseOrder");
			oPurchaseOrderItems = oPurchaseOrderModel.getProperty("/items");
			
			for(var i = 0; i < oPurchaseOrderItems.length; i++) {
				var oTempItem = oPurchaseOrderItems[i];
				oTempItem.itemId = i+1;
			}
		},
		
		
		/**
		 * Updates the item table in order to display changes of the underlying model.
		 */
		updateItemTable : function() {
			var oPurchaseOrderModel;
			
			//Assures that the changes of the underlying model are being displayed in the view.
			oPurchaseOrderModel = this.getView().getModel("newPurchaseOrder");
			oPurchaseOrderModel.refresh();						
			
			//Assures that the formatters are called again.
			this.getView().byId("itemTable").rerender();	
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