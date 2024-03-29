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

	return Controller.extend("ERPFrontendUI5.controller.purchaseOrder.PurchaseOrderEdit", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("purchaseOrderEditRoute").attachMatched(this._onRouteMatched, this);
			
			PurchaseOrderController.initializeDetailStatusComboBox(this.getView().byId("detailStatusComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query purchase order, material and business partner data every time a user navigates to this view. 
			//This assures that changes are being displayed in the ComboBox.
			BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this, false, "VENDOR");
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			AccountController.queryAccountsByWebService(this.queryAccountsCallback, this, false);
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
			
			if(oSelectedItem == null) {
				this.resetUIElements();
				return;
			}
				
			oPurchaseOrder = PurchaseOrderController.getPurchaseOrderById(oSelectedItem.getKey(), oPurchaseOrdersModel.oData.purchaseOrder);
			if(oPurchaseOrder != null)
				wsPurchaseOrder = this.getPurchaseOrderForWebService(oPurchaseOrder);
			
			//Set the model of the view according to the selected purchase order to allow binding of the UI elements.
			this.getView().setModel(wsPurchaseOrder, "selectedPurchaseOrder");
			
			this.setActiveDetailStatus();
			PurchaseOrderController.initializePurchaseOrderItemModel(this);
		},
		
		
		/**
		 * Handles the selection of an item in the vendor ComboBox.
		 */
		onVendorSelectionChange : function (oControlEvent) {
			var oPurchaseOrderModel = this.getView().getModel("selectedPurchaseOrder");
			var iPartnerId = MainController.getSelectedCBItemKey(oControlEvent);
			
			oPurchaseOrderModel.setData({vendorId: iPartnerId}, true);
		},
		
		
		/**
		 * Handles the selection of an item in the payment account ComboBox.
		 */
		onPaymentAccountSelectionChange : function (oControlEvent) {
			var oPurchaseOrderModel = this.getView().getModel("selectedPurchaseOrder");
			var iAccountId = MainController.getSelectedCBItemKey(oControlEvent);
			
			oPurchaseOrderModel.setData({paymentAccountId: iAccountId}, true);
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
			
			PurchaseOrderController.setIdOfNewItem(this.getView().getModel("selectedPurchaseOrder"), this);
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
				MessageBox.error(oResourceBundle.getText("purchaseOrderEdit.noItemSelected"));
				return;
			}
			
			PurchaseOrderController.deleteItemFromOrderModel(this.getSelectedItem(), this.getView().getModel("selectedPurchaseOrder"));
			PurchaseOrderController.updateItemIds(this.getView().getModel("selectedPurchaseOrder"));
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
		 * Handles the finishing of the element selection of the detail purchase order status MultiComboBox.
		 */
		onDetailStatusSelectionFinish : function (oControlEvent) {
			var oPurchaseOrderModel;
			var aStatus;
			var aSelectedItems = oControlEvent.getParameters().selectedItems;
			var bStatusIncluded = false;
			
			if(this.getView().byId("purchaseOrderComboBox").getSelectedKey() == "") {
				return;
			}
			
			oPurchaseOrderModel = this.getView().getModel("selectedPurchaseOrder");
			aStatus = oPurchaseOrderModel.getProperty("/status");
			
			//Remove status items, that are not set anymore.
			for(var i=0; i < aStatus.length; i++) {
				var sStatus = aStatus[i];
				bStatusIncluded = false;
				
				//The following status can not be set by the user and are therefore ignored.
				if(sStatus == "OPEN" || sStatus == "IN_PROCESS" || sStatus == "FINISHED") {
					continue;
				}
				
				for(var j=0; j < aSelectedItems.length; j++) {
					var sKey = aSelectedItems[j].getKey();
					
					if(sKey == sStatus) {
						bStatusIncluded = true;
					}
				}
				
				if(bStatusIncluded == false) {
					aStatus.splice(i, 1);					
				}
			}
			
			//Add status items, that have not been set before.
			for(var i=0; i < aSelectedItems.length; i++) {
				var sStatus = aSelectedItems[i].getKey();
				
				if(aStatus.includes(sStatus) == false) {
					aStatus.push(sStatus);
				}
			}
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
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var bInputValid = this.verifyObligatoryFields();
			
			if(bInputValid == false)
				return;
				
			PurchaseOrderController.savePurchaseOrderByWebService(this.getView().getModel("selectedPurchaseOrder"), this.savePurchaseOrderCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			MainController.navigateToStartpage(sap.ui.core.UIComponent.getRouterFor(this), this.getOwnerComponent().getModel("navigation"));
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("purchaseOrderComboBox").setSelectedItem(null);
			
			this.getView().byId("idText").setText("");
			this.getView().byId("totalStatus").setText("");
			this.getView().byId("detailStatusComboBox").setSelectedItems(null);
			
			this.getView().byId("orderDatePicker").setDateValue(null);
			this.getView().byId("requestedDeliveryDatePicker").setDateValue(null);	
			
			this.getView().byId("vendorComboBox").setSelectedItem(null);
			
			this.getView().byId("paymentAccountComboBox").setSelectedItem(null);
			
			this.getView().byId("itemTable").destroyItems();
		},
		
		
		/**
		 * Sets the selected elements of the detail status MultiComboBox based on the selected purchase order.
		 */
		setActiveDetailStatus : function () {
			var oPurchaseOrderModel = this.getView().getModel("selectedPurchaseOrder");
			var aStatus = oPurchaseOrderModel.getProperty("/status");
			var aSelectedKeys = new Array();
			
			for(var i=0; i < aStatus.length; i++) {
				var sStatus = aStatus[i];
				
				//The following status can not be set by the user and are therefore ignored.
				if(sStatus == "OPEN" || sStatus == "IN_PROCESS" || sStatus == "FINISHED") {
					continue;
				}
				
				aSelectedKeys.push(sStatus);
			}
			
			this.getView().byId("detailStatusComboBox").setSelectedKeys(aSelectedKeys);
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
				MessageBox.error(oResourceBundle.getText("purchaseOrderEdit.noVendorSelected"));
				return false;
			}
			
			if(this.getView().byId("paymentAccountComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("purchaseOrderEdit.noPaymentAccountSelected"));
				return false;
			}
			
			//The order has to have at least one item.
			oPurchaseOrderModel = this.getView().getModel("selectedPurchaseOrder");
			iExistingItemCount = oPurchaseOrderModel.oData.items.length;
			
			if(iExistingItemCount < 1) {
				MessageBox.error(oResourceBundle.getText("purchaseOrderEdit.noItemsExist"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Updates the item table in order to display changes of the underlying model.
		 */
		updateItemTable : function() {
			var oPurchaseOrderModel;
			
			//Assures that the changes of the underlying model are being displayed in the view.
			oPurchaseOrderModel = this.getView().getModel("selectedPurchaseOrder");
			oPurchaseOrderModel.refresh();						
			
			//Assures that the formatters are called again.
			this.getView().byId("itemTable").rerender();	
		},
		
		
		/**
		 * Formatter of the material currency in the item table. Provides the currency of a material based on the given ID.
		 */
		materialCurrencyFormatter: function(iMaterialId) {
			return MaterialController.materialCurrencyFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Formatter of the material text in the item table. Provides the name of a material based on the given ID.
		 */
		materialNameFormatter : function(iMaterialId) {
			return MaterialController.materialNameFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Formatter of the material unit in the item table. Provides the unit of a material based on the given ID.
		 */
		materialUnitFormatter: function(iMaterialId) {
			return MaterialController.materialUnitFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Formatter of the purchase order status text.
		 */
		totalStatusTextFormatter: function(aStatus) {
			return PurchaseOrderController.totalStatusTextFormatter(aStatus, this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Formatter of the sales order status state.
		 */
		totalStatusStateFormatter: function(aStatus) {
			return PurchaseOrderController.totalStatusStateFormatter(aStatus);
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
			wsPurchaseOrder.setProperty("/paymentAccountId", oPurchaseOrder.paymentAccount.id);
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
		 * Gets the the selected purchase order item.
		 */
		getSelectedItem : function () {
			var oListItem = this.getView().byId("itemTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("selectedPurchaseOrder");
			var oSelectedItem = oContext.getProperty(null, oContext);
			
			return oSelectedItem;
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
		 *  Callback function of the savePurchaseOrder RESTful WebService call in the PurchaseOrderController.
		 */
		savePurchaseOrderCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new purchase order data.
					PurchaseOrderController.queryPurchaseOrdersByWebService(oCallingController.queryPurchaseOrdersCallback, oCallingController, false);
					
					oCallingController.getView().setModel(null, "selectedPurchaseOrder");
					PurchaseOrderController.initializePurchaseOrderItemModel(oCallingController);
					oCallingController.resetUIElements();
					
					MessageToast.show(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'I') {
					MessageToast.show(oReturnData.message[0].text);
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