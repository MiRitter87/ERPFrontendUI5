sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./SalesOrderController",
	"../businessPartner/BusinessPartnerController",
	"../material/MaterialController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, SalesOrderController, BusinessPartnerController, MaterialController, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.salesOrder.SalesOrderEdit", {		
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("salesOrderEditRoute").attachMatched(this._onRouteMatched, this);
			
			SalesOrderController.initializeStatusComboBox(this.getView().byId("statusComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query sales order, material and business partner data every time a user navigates to this view. 
			//This assures that changes are being displayed in the ComboBox.
			BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this, false, "CUSTOMER");
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			SalesOrderController.querySalesOrdersByWebService(this.querySalesOrdersCallback, this, true);
			
			this.getView().setModel(null, "selectedSalesOrder");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the sales order ComboBox.
		 */
		onSalesOrderSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oSalesOrdersModel = this.getView().getModel("salesOrders");
			var oSalesOrder, wsSalesOrder;
			
			if(oSelectedItem == null)
				return;
				
			oSalesOrder = SalesOrderController.getSalesOrderById(oSelectedItem.getKey(), oSalesOrdersModel.oData.salesOrder);
			if(oSalesOrder != null)
				wsSalesOrder = this.getSalesOrderForWebService(oSalesOrder);
			
			//Set the model of the view according to the selected sales order to allow binding of the UI elements.
			this.getView().setModel(wsSalesOrder, "selectedSalesOrder");
		},
		
		
		/**
		 * Handles the selection of an item in the sold-To party ComboBox.
		 */
		onSoldToSelectionChange : function (oControlEvent) {
			var oSalesOrderModel = this.getView().getModel("selectedSalesOrder");
			var iPartnerId = SalesOrderController.getSelectedPartnerId(oControlEvent);
			
			oSalesOrderModel.setData({soldToId: iPartnerId}, true);
		},
		
		
		/**
		 * Handles the selection of an item in the ship-To party ComboBox.
		 */
		onShipToSelectionChange : function (oControlEvent) {
			var oSalesOrderModel = this.getView().getModel("selectedSalesOrder");
			var iPartnerId = SalesOrderController.getSelectedPartnerId(oControlEvent);
			
			oSalesOrderModel.setData({shipToId: iPartnerId}, true);
		},
		
		
		/**
		 * Handles the selection of an item in the bill-To party ComboBox.
		 */
		onBillToSelectionChange : function (oControlEvent) {
			var oSalesOrderModel = this.getView().getModel("selectedSalesOrder");
			var iPartnerId = SalesOrderController.getSelectedPartnerId(oControlEvent);
			
			oSalesOrderModel.setData({billToId: iPartnerId}, true);
		},
		
		
		/**
		 * Opens the dialog to add a new sales order item.
		 */
		onAddItemPressed : function () {
			var oResourceBundle;
			
			if(this.byId("salesOrderComboBox").getSelectedKey() == "") {
				oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("salesOrderEdit.noOrderSelected"));
				return;
			}
			
			SalesOrderController.initializeSalesOrderItemModel(this);
			SalesOrderController.setIdOfNewItem(this.getView().getModel("selectedSalesOrder"), this);
			SalesOrderController.openFragmentAsPopUp(this, "ERPFrontendUI5.view.salesOrder.SalesOrderItemCreate");		
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
				MessageBox.error(oResourceBundle.getText("salesOrderEdit.noItemSelected"));
				return;
			}
			
			this.deleteItemFromOrderModel(this.getSelectedItem());
			this.updateItemIds();
			this.updateItemTable();
		},
		
		
		/**
		 * Handles the saving of the new item Dialog.
		 */
		onSaveDialog : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oItemData = this.getView().getModel("newSalesOrderItem");
			var oSalesOrderModel = this.getView().getModel("selectedSalesOrder");
			var oSalesOrderItems = oSalesOrderModel.getProperty("/items");
			var itemWithMaterialExists;
			
			//Check if a material has been selected.
			if(this.getView().byId("materialComboBox").getSelectedItem() == null) {
				MessageBox.error(oResourceBundle.getText("salesOrderEdit.noMaterialSelected"));
				return;
			}
			
			//Do not allow adding an item with quantity 0.
			if(oItemData.oData.quantity < 1) {
				MessageBox.error(oResourceBundle.getText("salesOrderEdit.quantityIsZero"));
				return;
			}
			
			//Check if a sales order item with the same material already exists.
			itemWithMaterialExists = SalesOrderController.isItemWithMaterialExisting(oSalesOrderItems, oItemData.oData.materialId);
			if(itemWithMaterialExists == true) {
				MessageBox.error(oResourceBundle.getText("salesOrderEdit.itemWithMaterialExists", [oItemData.oData.materialId]));
				return;
			}
			
			//Remove the binding of the UI to the selectedMaterial. 
			//Otherwhise the selectedMaterial is updated by databinding when the input fields are being cleared.
			this.getView().setModel(null, "selectedMaterial");
			
			//Add the item to the sales order model. Then re-initialize the item model that is bound to the "new item PopUp".
			oSalesOrderItems.push(oItemData.oData);
			oSalesOrderModel.setProperty("/items", oSalesOrderItems);
			SalesOrderController.initializeSalesOrderItemModel(this);
			
			this.byId("newItemDialog").close();
			SalesOrderController.clearItemPopUpFields(this);
		},

		
		/**
		 * Handles the closing by cancelation of the new item Dialog.
		 */
		onCancelDialog : function () {
			this.byId("newItemDialog").close();
			this.byId("materialComboBox").setSelectedItem(null);
		},
		
		
		/**
		 * Handles the selection of an item in the material ComboBox.
		 */
		onMaterialSelectionChange : function (oControlEvent) {
			SalesOrderController.onMaterialSelectionChange(oControlEvent, this,
				this.getView().getModel("newSalesOrderItem"),
				this.getView().getModel("materials"));
		},
		
		
		/**
		 * Handles changes of the input for sales order item quantity.
		 */
		onQuantityChange : function () {
			if(this.getView().byId("materialComboBox").getSelectedItem() == null) {
				this.getView().setModel(null, "selectedMaterial");
				SalesOrderController.clearItemPopUpFields(this);
				return;
			}			
			
			SalesOrderController.updatePriceTotal(
				this.getView().getModel("selectedMaterial"),
				this.getView().getModel("newSalesOrderItem"));
		},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var bInputValid = this.verifyObligatoryFields();
			
			if(bInputValid == false)
				return;
				
			SalesOrderController.saveSalesOrderByWebService(this.getView().getModel("selectedSalesOrder"), this.saveSalesOrderCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");
		},
		
		
		/**
		 * Formatter of the material text in the item table. Provides the name of a material based on the given ID.
		 */
		materialNameFormatter : function(iMaterialId) {
			return SalesOrderController.materialNameFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Formatter of the material unit in the item table. Provides the unit of a material based on the given ID.
		 */
		materialUnitFormatter: function(iMaterialId) {
			return SalesOrderController.materialUnitFormatter(iMaterialId, this.getView().getModel("materials"));
		},
		
		
		/**
		 * Formatter of the material currency in the item table. Provides the currency of a material based on the given ID.
		 */
		materialCurrencyFormatter: function(iMaterialId) {
			return SalesOrderController.materialCurrencyFormatter(iMaterialId, this.getView().getModel("materials"));
		},


		/**
		 * Callback function of the querySalesOrders RESTful WebService call in the SalesOrderController.
		 */
		querySalesOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				SalesOrderController.initializeDatesAsObject(oModel.oData.salesOrder);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("salesOrderEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "salesOrders");
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
		 *  Callback function of the saveSalesOrder RESTful WebService call in the SalesOrderController.
		 */
		saveSalesOrderCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new sales order data.
					SalesOrderController.querySalesOrdersByWebService(oCallingController.querySalesOrdersCallback, oCallingController, false);
					
					oCallingController.getView().setModel(null, "selectedSalesOrder");
					SalesOrderController.initializeSalesOrderItemModel(oCallingController);
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
		},
		
		
		/**
		 * Creates a representation of a sales order that can be processed by the WebService.
		 */
		getSalesOrderForWebService : function(oSalesOrder) {
			var wsSalesOrder = new JSONModel();
			var wsSalesOrderItem;
			
			//Data at head level
			wsSalesOrder.setProperty("/salesOrderId", oSalesOrder.id);
			wsSalesOrder.setProperty("/soldToId", oSalesOrder.soldToParty.id);
			wsSalesOrder.setProperty("/shipToId", oSalesOrder.shipToParty.id);
			wsSalesOrder.setProperty("/billToId", oSalesOrder.billToParty.id);
			wsSalesOrder.setProperty("/orderDate", oSalesOrder.orderDate);
			wsSalesOrder.setProperty("/requestedDeliveryDate", oSalesOrder.requestedDeliveryDate);
			wsSalesOrder.setProperty("/status", oSalesOrder.status);
			
			//Data at item level
			wsSalesOrder.setProperty("/items", new Array());
			
			for(var i = 0; i < oSalesOrder.items.length; i++) {
				var oTempSalesOrderItem = oSalesOrder.items[i];
				
				wsSalesOrderItem = new JSONModel();
				wsSalesOrderItem.setProperty("/itemId", oTempSalesOrderItem.id);
				wsSalesOrderItem.setProperty("/materialId", oTempSalesOrderItem.material.id);
				wsSalesOrderItem.setProperty("/quantity", oTempSalesOrderItem.quantity);
				wsSalesOrderItem.setProperty("/priceTotal", oTempSalesOrderItem.priceTotal);
				
				wsSalesOrder.oData.items.push(wsSalesOrderItem.oData);
			}
			
			return wsSalesOrder;
		},
		
		
		/**
		 * Gets the the selected sales order item.
		 */
		getSelectedItem : function () {
			var oListItem = this.getView().byId("itemTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("selectedSalesOrder");
			var oSelectedItem = oContext.getProperty(null, oContext);
			
			return oSelectedItem;
		},
		
		
		/**
		 * Resets the UI elements.
		 */
		resetUIElements : function () {
			this.getView().byId("salesOrderComboBox").setSelectedItem(null);
			
			this.getView().byId("idText").setText("");
			this.getView().byId("statusComboBox").setSelectedItem(null);
			
			this.getView().byId("soldToComboBox").setSelectedItem(null);
			this.getView().byId("shipToComboBox").setSelectedItem(null);
			this.getView().byId("billToComboBox").setSelectedItem(null);
			
			this.getView().byId("orderDatePicker").setDateValue(null);
			this.getView().byId("requestedDeliveryDatePicker").setDateValue(null);	
			
			this.getView().byId("itemTable").destroyItems();
		},
		
		
		/**
		 * Verifies input of obligatory fields.
		 * Returns true if input is valid. Returns false if input is invalid.
		 */
		verifyObligatoryFields : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var iExistingItemCount;
			var oSalesOrderModel;
			
			if(this.getView().byId("statusComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("salesOrderEdit.noStatusSelected"));
				return false;
			}
			
			if(this.getView().byId("soldToComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("salesOrderEdit.noSoldToSelected"));
				return false;
			}
			
			if(this.getView().byId("shipToComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("salesOrderEdit.noShipToSelected"));
				return false;
			}
			
			if(this.getView().byId("billToComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("salesOrderEdit.noBillToSelected"));
				return false;
			}
			
			//The order has to have at least one item.
			oSalesOrderModel = this.getView().getModel("selectedSalesOrder");
			iExistingItemCount = oSalesOrderModel.oData.items.length;
			
			if(iExistingItemCount < 1) {
				MessageBox.error(oResourceBundle.getText("salesOrderEdit.noItemsExist"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Deletes the given sales order item from the sales order model.
		 */
		deleteItemFromOrderModel : function(oSalesOrderItem) {
			var oSalesOrderModel, oSalesOrderItems;
			
			oSalesOrderModel = this.getView().getModel("selectedSalesOrder");
			oSalesOrderItems = oSalesOrderModel.getProperty("/items");
			
			for(var i = 0; i < oSalesOrderItems.length; i++) {
    			var oTempItem = oSalesOrderItems[i];
    			
				if(oTempItem.itemId == oSalesOrderItem.itemId) {
					oSalesOrderItems.splice(i, 1);
				}
			}
		},
		
		
		/**
		 * Updates the IDs of the sales order items incrementally.
	     * The item IDs range from 1 to n, where n is the number of items.
		 */
		updateItemIds : function() {
			var oSalesOrderItems, oSalesOrderModel;

			oSalesOrderModel = this.getView().getModel("selectedSalesOrder");
			oSalesOrderItems = oSalesOrderModel.getProperty("/items");
			
			for(var i = 0; i < oSalesOrderItems.length; i++) {
				var oTempItem = oSalesOrderItems[i];
				oTempItem.itemId = i+1;
			}
		},
		
		
		/**
		 * Updates the item table in order to display changes of the underlying model.
		 */
		updateItemTable : function() {
			var oSalesOrderModel;
			
			//Assures that the changes of the underlying model are being displayed in the view.
			oSalesOrderModel = this.getView().getModel("selectedSalesOrder");
			oSalesOrderModel.refresh();						
			
			//Assures that the formatters are called again.
			this.getView().byId("itemTable").rerender();	
		}
	});
});