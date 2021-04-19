sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../businessPartner/BusinessPartnerController",
	"../material/MaterialController",
	"./SalesOrderController",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Controller, BusinessPartnerController, MaterialController, SalesOrderController, Fragment, MessageToast, MessageBox, JSONModel) {
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
			
			this.initializeSalesOrderModel();
			this.initializeSalesOrderItemModel();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query business partner and material data every time a user navigates to this view. This assures that changes are being displayed in the ComboBoxes.
			BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this);
			MaterialController.queryMaterialsByWebService(this.queryMaterialsCallback, this, false);
			this.deselectPartnerSelection();
    	},
		
		
		/**
		 * Opens the dialog to add a new sales order item.
		 */
		onAddItemPressed : function () {
			this.setIdOfNewItem();
			this.openNewItemPopUp();
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
		 * Gets the ID of the selected business partner from a ComboBox.
		 */
		getSelectedPartnerId : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oBusinessPartners = this.getView().getModel("businessPartners");
			
			if(oSelectedItem == null)
				return null;
			
			//Get the selected business partner from the array of all partners according to the id.
			for(var i = 0; i < oBusinessPartners.oData.businessPartner.length; i++) {
    			var oTempBusinessPartner = oBusinessPartners.oData.businessPartner[i];
    			
				if(oTempBusinessPartner.id == oSelectedItem.getKey()) {
					return oTempBusinessPartner.id;
				}
			}
		},


		/**
		 * Handles the saving of the new item Dialog.
		 */
		onSaveDialog : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oItemData = this.getView().getModel("newSalesOrderItem");
			var oSalesOrderModel = this.getView().getModel("newSalesOrder");
			var oSalesOrderItems = oSalesOrderModel.getProperty("/items");
			
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
			
			//Add the item to the sales order model. Then re-initialize the item model that is bound to the "new item PopUp".
			oSalesOrderItems.push(oItemData.oData);
			oSalesOrderModel.setProperty("/items", oSalesOrderItems);
			this.initializeSalesOrderItemModel();
			
			this.byId("newItemDialog").close();
			this.clearItemPopUpFields();
		},

		
		/**
		 * Handles the closing by cancelation of the new item Dialog.
		 */
		onCancelDialog : function () {
			this.byId("newItemDialog").close();
			this.clearItemPopUpFields();			
		},
		
		
		/**
		 * Handles the selection of an item in the material ComboBox.
		 */
		onMaterialSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oSelectedMaterialModel = new JSONModel();
			var oItemModel = this.getView().getModel("newSalesOrderItem");
			var oMaterials = this.getView().getModel("materials");
			var oMaterial;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected material from the array of all materials according to the id.
			for(var i = 0; i < oMaterials.oData.material.length; i++) {
    			var oTempMaterial = oMaterials.oData.material[i];
    			
				if(oTempMaterial.id == oSelectedItem.getKey()) {
					oMaterial = oTempMaterial;
				}
			}
			
			//Set the model of the view according to the selected material to allow binding of the UI elements.
			oSelectedMaterialModel.setData(oMaterial);
			this.getView().setModel(oSelectedMaterialModel, "selectedMaterial");
			
			//Update the material ID of the item model that is bound to the view.
			oItemModel.setProperty("/materialId", oMaterial.id);
			
			this.updatePriceTotal();
		},
		
		
		/**
		 * Handles changes of the input for sales order item quantity.
		 */
		onQuantityChange : function () {
			this.updatePriceTotal();
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
		 * Initializes the model of the sales order item to which the UI controls are bound.
		 */
		initializeSalesOrderItemModel : function () {
			var oItemModel = new JSONModel();
			
			//Load and set item model
			oItemModel.loadData("model/salesOrder/salesOrderItemCreate.json");
			this.getView().setModel(oItemModel, "newSalesOrderItem");	
		},
		
		
		/**
		 * Updates the total price of the sales order item based on the materials price per unit and the quantity ordered.
		 */
		updatePriceTotal : function () {
			var oSelectedMaterialModel = this.getView().getModel("selectedMaterial");
			var oItemModel = this.getView().getModel("newSalesOrderItem");
			var fPricePerUnit, fPriceTotal, iQuantity;
			
			fPricePerUnit = oSelectedMaterialModel.getProperty("/pricePerUnit");
			iQuantity = oItemModel.getProperty("/quantity");
			fPriceTotal = parseFloat((fPricePerUnit * iQuantity).toFixed(2));	//Round to two decimal places
			
			oItemModel.setProperty("/priceTotal", fPriceTotal);
		},
		
		
		/**
		 * Clears the fields and CheckBox of the PopUp for item creation.
		 */
		clearItemPopUpFields : function () {
			this.byId("materialComboBox").setSelectedItem(null);
			this.byId("itemUnitText").setText("");
			this.byId("itemCurrencyText").setText("");
		},
		
		
		/**
		 * Opens the PopUp for item creation.
		 */
		openNewItemPopUp : function () {
			var oView = this.getView();
			
			//create dialog lazily
			if (!this.pDialog) {
				this.pDialog = Fragment.load({
					id: oView.getId(),
					name: "ERPFrontendUI5.view.salesOrder.SalesOrderItemCreate",
					controller: this
				}).then(function (oDialog) {
					//connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});
		},
		
		
		/**
		 * Sets the ID of the new sales order item based on the number of already existing items.
		 */
		setIdOfNewItem : function () {
			var iExistingItemCount;
			var oSalesOrderModel = this.getView().getModel("newSalesOrder");
			var oSalesOrderItemModel = this.getView().getModel("newSalesOrderItem");
			
			iExistingItemCount = oSalesOrderModel.oData.items.length;
			oSalesOrderItemModel.setProperty("/itemId", iExistingItemCount + 1);
		},
		
		
		/**
		 * Formatter of the material text in the item table. Provides the name of a material based on the given ID.
		 */
		materialNameFormatter : function(iMaterialId) {
			var oMaterial = this.getMaterialById(iMaterialId);
			
			if(oMaterial != null)	
				return oMaterial.name;
			else
				return "";
		},
		
		
		/**
		 * Formatter of the material unit in the item table. Provides the unit of a material based on the given ID.
		 */
		materialUnitFormatter: function(iMaterialId) {
			var oMaterial = this.getMaterialById(iMaterialId);
			
			if(oMaterial != null)	
				return oMaterial.unit;
			else
				return "";
		},
		
		
		/**
		 * Formatter of the material currency in the item table. Provides the currency of a material based on the given ID.
		 */
		materialCurrencyFormatter: function(iMaterialId) {
			var oMaterial = this.getMaterialById(iMaterialId);
			
			if(oMaterial != null)	
				return oMaterial.currency;
			else
				return "";
		},
		
		
		/**
		 * Gets the material data of the material with the given ID.
		 */
		getMaterialById : function(iMaterialId) {
			var oMaterials = this.getView().getModel("materials");
			
			for(var i = 0; i < oMaterials.oData.material.length; i++) {
    			var tempMaterial = oMaterials.oData.material[i];
    			
				if(tempMaterial.id == iMaterialId) {
					return tempMaterial;
				}
			}
			
			return null;
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
					callingController.initializeSalesOrderItemModel();
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