sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../businessPartner/BusinessPartnerController",
	"../material/MaterialController",
	"./SalesOrderController",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Controller, BusinessPartnerController, MaterialController, SalesOrderController, MessageToast, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.salesOrder.SalesOrderCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oView, oMessageManager, oRouter;
			oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("salesOrderCreateRoute").attachMatched(this._onRouteMatched, this);
			
			//Initialize message manager for input form validation.
			oView = this.getView();
			oMessageManager = sap.ui.getCore().getMessageManager();
			oView.setModel(oMessageManager.getMessageModel(), "message");
			oMessageManager.registerObject(oView, true);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query business partner and material data every time a user navigates to this view. This assures that changes are being displayed in the ComboBoxes.
			BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this);
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			
			this.deselectPartnerSelection();
			this.initializeSalesOrderModel();
			SalesOrderController.initializeSalesOrderItemModel(this);
    	},
		
		
		/**
		 * Opens the dialog to add a new sales order item.
		 */
		onAddItemPressed : function () {
			SalesOrderController.setIdOfNewItem(this.getView().getModel("newSalesOrder"), this);
			SalesOrderController.openNewItemPopUp(this);
		},
		
		
		/**
		 * Handles the deletion of an item.
		 */
		onDeleteItemPressed : function () {
			var oSelectedItem, oResourceBundle,  oSalesOrderModel, oSalesOrderItems, oSalesOrderItem;
			
			//Check if an item has been selected.
			oSelectedItem = this.getView().byId("itemTable").getSelectedItem();
			if(oSelectedItem == null) {
				oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				MessageBox.error(oResourceBundle.getText("salesOrderCreate.noItemSelected"));
				return;
			}
			
			//Remove the selected item from the model.
			oSalesOrderModel = this.getView().getModel("newSalesOrder");
			oSalesOrderItems = oSalesOrderModel.getProperty("/items");
			oSalesOrderItem = this.getSelectedItem();
			
			for(var i = 0; i < oSalesOrderItems.length; i++) {
    			var oTempItem = oSalesOrderItems[i];
    			
				if(oTempItem.itemId == oSalesOrderItem.itemId) {
					oSalesOrderItems.splice(i, 1);
				}
			}
			
			//Update the item IDs accounting for the deleted item.
			for(var i = 0; i < oSalesOrderItems.length; i++) {
				var oTempItem = oSalesOrderItems[i];
				oTempItem.itemId = i+1;
			}
			
			oSalesOrderModel.refresh();						//Assures that the changes are being displayed in the view.
			this.getView().byId("itemTable").rerender();	//Assures that the formatters are called again.
		},
		
		
		/**
		 * Handles the selection of an item in the sold-To party ComboBox.
		 */
		onSoldToSelectionChange : function (oControlEvent) {
			var oSalesOrderModel = this.getView().getModel("newSalesOrder");
			var iPartnerId = this.getSelectedPartnerId(oControlEvent);
			
			oSalesOrderModel.setData({soldToId: iPartnerId}, true);
		},
		
		
		/**
		 * Handles the selection of an item in the ship-To party ComboBox.
		 */
		onShipToSelectionChange : function (oControlEvent) {
			var oSalesOrderModel = this.getView().getModel("newSalesOrder");
			var iPartnerId = this.getSelectedPartnerId(oControlEvent);
			
			oSalesOrderModel.setData({shipToId: iPartnerId}, true);
		},
		
		
		/**
		 * Handles the selection of an item in the bill-To party ComboBox.
		 */
		onBillToSelectionChange : function (oControlEvent) {
			var oSalesOrderModel = this.getView().getModel("newSalesOrder");
			var iPartnerId = this.getSelectedPartnerId(oControlEvent);
			
			oSalesOrderModel.setData({billToId: iPartnerId}, true);
		},
		
		
		/**
		 * Gets the the selected sales order item.
		 */
		getSelectedItem : function () {
			var oListItem = this.getView().byId("itemTable").getSelectedItem();
			var oContext = oListItem.getBindingContext("newSalesOrder");
			var oSelectedItem = oContext.getProperty(null, oContext);
			
			return oSelectedItem;
		},
		
		
		/**
		 * Gets the ID of the selected business partner from a ComboBox.
		 */
		getSelectedPartnerId : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			
			if(oSelectedItem == null)
				return null;
				
			return oSelectedItem.getKey();
		},


		/**
		 * Handles the saving of the new item Dialog.
		 */
		onSaveDialog : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oItemData = this.getView().getModel("newSalesOrderItem");
			var oSalesOrderModel = this.getView().getModel("newSalesOrder");
			var oSalesOrderItems = oSalesOrderModel.getProperty("/items");
			var itemWithMaterialExists;
			
			//Check if a material has been selected.
			if(this.getView().byId("materialComboBox").getSelectedItem() == null) {
				MessageBox.error(oResourceBundle.getText("salesOrderCreate.noMaterialSelected"));
				return;
			}
			
			//Do not allow adding an item with quantity 0.
			if(oItemData.oData.quantity < 1) {
				MessageBox.error(oResourceBundle.getText("salesOrderCreate.quantityIsZero"));
				return;
			}
			
			//Check if a sales order item with the same material already exists.
			itemWithMaterialExists = SalesOrderController.isItemWithMaterialExisting(oSalesOrderItems, oItemData.oData.materialId);
			if(itemWithMaterialExists == true) {
				MessageBox.error(oResourceBundle.getText("salesOrderCreate.itemWithMaterialExists", [oItemData.oData.materialId]));
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
			SalesOrderController.clearItemPopUpFields(this);			
		},
		
		
		/**
		 * Handles the selection of an item in the material ComboBox.
		 */
		onMaterialSelectionChange : function (oControlEvent) {
			SalesOrderController.onMaterialSelectionChange(oControlEvent, this,
				this.getView().getModel("newSalesOrderItem"),
				this.getView().getModel("materials"),
				new JSONModel());
		},
		
		
		/**
		 * Handles changes of the input for sales order item quantity.
		 */
		onQuantityChange : function () {
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
				
			SalesOrderController.createSalesOrderByWebService(this.getView().getModel("newSalesOrder"), this.saveSalesOrderCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");
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
		 * Resets the selection of the business partners. No item in the ComboBox is selected afterwards.
		 */
		deselectPartnerSelection : function () {
			this.getView().byId("soldToComboBox").setSelectedItem(null);
			this.getView().byId("shipToComboBox").setSelectedItem(null);
			this.getView().byId("billToComboBox").setSelectedItem(null);
		},
		
		
		/**
		 * Initializes the model of the sales order to which the UI controls are bound.
		 */
		initializeSalesOrderModel : function () {
			var oSalesOrderModel = new JSONModel();
			
			//Load and set order model
			oSalesOrderModel.loadData("model/salesOrder/salesOrderCreate.json");
			oSalesOrderModel.attachRequestCompleted(function() {
				//Wait for date initialization until the JSON data have been loaded. Otherwise the date would be overwritten.
				oSalesOrderModel.setProperty("/orderDate", new Date());
				oSalesOrderModel.setProperty("/requestedDeliveryDate", new Date());
   			 });
			
			this.getView().setModel(oSalesOrderModel, "newSalesOrder");	
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
		 * Verifies input of obligatory fields.
		 * Returns true if input is valid. Returns false if input is invalid.
		 */
		verifyObligatoryFields : function() {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var iExistingItemCount;
			var oSalesOrderModel;
			
			if(this.getView().byId("soldToComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("salesOrderCreate.noSoldToSelected"));
				return false;
			}
			
			if(this.getView().byId("shipToComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("salesOrderCreate.noShipToSelected"));
				return false;
			}
			
			if(this.getView().byId("billToComboBox").getSelectedKey() == "") {
				MessageBox.error(oResourceBundle.getText("salesOrderCreate.noBillToSelected"));
				return false;
			}
			
			//The order has to have at least one item.
			oSalesOrderModel = this.getView().getModel("newSalesOrder");
			iExistingItemCount = oSalesOrderModel.oData.items.length;
			
			if(iExistingItemCount < 1) {
				MessageBox.error(oResourceBundle.getText("salesOrderCreate.noItemsExist"));
				return false;
			}
			
			return true;
		},
		
		
		/**
		 * Resets the form fields to the initial state.
		 */
		resetFormFields : function () {
			this.getView().byId("soldToComboBox").setSelectedItem(null);
			this.getView().byId("shipToComboBox").setSelectedItem(null);
			this.getView().byId("billToComboBox").setSelectedItem(null);
		},
		
		
		/**
		 * Callback function of the createSalesOrderbyWebService RESTful WebService call in the SalesOrderController.
		 */
		saveSalesOrderCallback : function (oReturnData, callingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					callingController.resetFormFields();
					callingController.initializeSalesOrderModel();
					SalesOrderController.initializeSalesOrderItemModel(callingController);
				}
				
				if(oReturnData.message[0].type == 'E') {
					MessageBox.error(oReturnData.message[0].text);
				}
				
				if(oReturnData.message[0].type == 'W') {
					MessageBox.warning(oReturnData.message[0].text);
				}
			} 
		},
	});
});