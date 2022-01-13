sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../businessPartner/BusinessPartnerController",
	"../material/MaterialController",
	"../account/AccountController",
	"./PurchaseOrderController",
	"../MainController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, BusinessPartnerController, MaterialController, AccountController, PurchaseOrderController, MainController, 
			JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.purchaseOrder.PurchaseOrderCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("purchaseOrderCreateRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query business partner, material and account data every time a user navigates to this view. 
			//This assures that changes are being displayed in the ComboBoxes.
			BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this, false, "VENDOR");
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			AccountController.queryAccountsByWebService(this.queryAccountsCallback, this, false);
			
			this.resetUIElements();
			this.initializePurchaseOrderModel();
			PurchaseOrderController.initializePurchaseOrderItemModel(this);
    	},


		/**
		 * Handles the selection of an item in the vendor ComboBox.
		 */
		onVendorSelectionChange : function (oControlEvent) {
			var oPurchaseOrderModel = this.getView().getModel("newPurchaseOrder");
			var iPartnerId = MainController.getSelectedCBItemKey(oControlEvent);
			
			oPurchaseOrderModel.setData({vendorId: iPartnerId}, true);
		},
		
		
		/**
		 * Handles the selection of an item in the payment account ComboBox.
		 */
		onPaymentAccountSelectionChange : function (oControlEvent) {
			var oPurchaseOrderModel = this.getView().getModel("newPurchaseOrder");
			var iAccountId = MainController.getSelectedCBItemKey(oControlEvent);
			
			oPurchaseOrderModel.setData({paymentAccountId: iAccountId}, true);
		},
		
		
		/**
		 * Opens the dialog to add a new purchase order item.
		 */
		onAddItemPressed : function () {
			PurchaseOrderController.setIdOfNewItem(this.getView().getModel("newPurchaseOrder"), this);
			MainController.openFragmentAsPopUp(this, "ERPFrontendUI5.view.purchaseOrder.PurchaseOrderItemCreate");
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
			
			PurchaseOrderController.deleteItemFromOrderModel(this.getSelectedItem(), this.getView().getModel("newPurchaseOrder"));
			PurchaseOrderController.updateItemIds(this.getView().getModel("newPurchaseOrder"));
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
			var bInputValid = this.verifyObligatoryFields();
			
			if(bInputValid == false)
				return;
				
			PurchaseOrderController.createPurchaseOrderByWebService(this.getView().getModel("newPurchaseOrder"), this.savePurchaseOrderCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this), this.getOwnerComponent().getModel("navigation"));
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
		 * Verifies input of obligatory fields.
		 * Returns true if input is valid. Returns false if input is invalid.
		 */
		verifyObligatoryFields : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var iExistingItemCount;
			var oPurchaseOrderModel;
			
			if(this.getView().byId("vendorComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("purchaseOrderCreate.noVendorSelected"));
				return false;
			}
			
			if(this.getView().byId("paymentAccountComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("purchaseOrderCreate.noPaymentAccountSelected"));
				return false;
			}
			
			//The order has to have at least one item.
			oPurchaseOrderModel = this.getView().getModel("newPurchaseOrder");
			iExistingItemCount = oPurchaseOrderModel.oData.items.length;
			
			if(iExistingItemCount < 1) {
				MessageBox.error(oResourceBundle.getText("purchaseOrderCreate.noItemsExist"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Resets the UI elements..
		 */
		resetUIElements : function () {
			this.getView().byId("vendorComboBox").setSelectedItem(null);
			this.getView().byId("paymentAccountComboBox").setSelectedItem(null);
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
		},
		
		
		/**
		 * Callback function of the queryAccountsByWebService RESTful WebService call in the AccountController.
		 */
		queryAccountsCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}
			
			oCallingController.getView().setModel(oModel, "accounts");
		},
		
		
		/**
		 * Callback function of the createPurchaseOrderbyWebService RESTful WebService call in the PurchaseOrderController.
		 */
		savePurchaseOrderCallback : function (oReturnData, callingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					callingController.resetUIElements();
					callingController.initializePurchaseOrderModel();
					PurchaseOrderController.initializePurchaseOrderItemModel(callingController);
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