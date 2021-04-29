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
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query sales order and business partner data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this);
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			SalesOrderController.querySalesOrdersByWebService(this.querySalesOrdersCallback, this, true);
			
			SalesOrderController.initializeSalesOrderItemModel(this);
    	},


		/**
		 * Handles the selection of an item in the sales order ComboBox.
		 */
		onSalesOrderSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oSalesOrdersModel = this.getView().getModel("salesOrders");
			var oSalesOrders = oSalesOrdersModel.oData.salesOrder;
			var wsSalesOrder;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected sales order from the array of all sales orders according to the id.
			for(var i = 0; i < oSalesOrders.length; i++) {
    			var oTempSalesOrder = oSalesOrders[i];
    			
				if(oTempSalesOrder.id == oSelectedItem.getKey()) {
					wsSalesOrder = this.getSalesOrderForWebService(oTempSalesOrder);
				}
			}
			
			//Set the model of the view according to the selected sales order to allow binding of the UI elements.
			this.getView().setModel(wsSalesOrder, "selectedSalesOrder");
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
			
			SalesOrderController.setIdOfNewItem(this.getView().getModel("selectedSalesOrder"), this);
			SalesOrderController.openNewItemPopUp(this);			
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
			SalesOrderController.initializeSalesOrderItemModel(this);
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
		 * Callback function of the queryMaterial RESTful WebService call in the MaterialController.
		 */
		querySalesOrdersCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				oCallingController.initializeDatesAsObject(oModel.oData.salesOrder);
				
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
		 * The WebService provides dates as milliseconds since 01.01.1970.
	     * This function initializes the date properties as Date objects based on the given values.
		 */
		initializeDatesAsObject : function(oSalesOrders) {			
			for(var i = 0; i < oSalesOrders.length; i++) {
    			var oTempSalesOrder = oSalesOrders[i];
				var oDate;
    			
				if(oTempSalesOrder.orderDate != null) {
					oDate = new Date(oTempSalesOrder.orderDate);
					oTempSalesOrder.orderDate = oDate;					
				}
				
				if(oTempSalesOrder.requestedDeliveryDate != null) {
					oDate = new Date(oTempSalesOrder.requestedDeliveryDate);
					oTempSalesOrder.requestedDeliveryDate = oDate;					
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
			wsSalesOrder.setProperty("/id", oSalesOrder.id);
			wsSalesOrder.setProperty("/soldToId", oSalesOrder.soldToParty.id);
			wsSalesOrder.setProperty("/shipToId", oSalesOrder.shipToParty.id);
			wsSalesOrder.setProperty("/billToId", oSalesOrder.billToParty.id);
			wsSalesOrder.setProperty("/orderDate", oSalesOrder.orderDate);
			wsSalesOrder.setProperty("/requestedDeliveryDate", oSalesOrder.requestedDeliveryDate);
			
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
		}
	});
});