sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../businessPartner/BusinessPartnerController",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, BusinessPartnerController, Fragment, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.salesOrder.SalesOrderCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("salesOrderCreateRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeSalesOrderModel();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			//Query business partner data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			BusinessPartnerController.queryBusinessPartnersByWebService(this.queryBusinessPartnersCallback, this);
			this.deselectPartnerSelection();
    	},
		
		
		/**
		 * Opens the dialog to add a new sales order item.
		 */
		onAddItemPressed : function () {
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
			var oModel = this.getView().getModel();
			var oBusinessPartners = oModel.oData.businessPartners;
			
			if(oSelectedItem == null)
				return null;
			
			//Get the selected business partner from the array of all partners according to the id.
			for(var i = 0; i < oBusinessPartners.data.businessPartner.length; i++) {
    			var oTempBusinessPartner = oBusinessPartners.data.businessPartner[i];
    			
				if(oTempBusinessPartner.id == oSelectedItem.getKey()) {
					return oTempBusinessPartner.id;
				}
			}
		},


		/**
		 * Handles the saving of the new item Dialog.
		 */
		onSaveDialog : function () {
			this.byId("newItemDialog").close();
		},

		
		/**
		 * Handles the closing of the new item Dialog.
		 */
		onCancelDialog : function () {
			this.byId("newItemDialog").close();
		},
		
		
		/**
		 * Callback function of the queryBusinessPartners RESTful WebService call in the BusinessPartnerController.
		 */
		queryBusinessPartnersCallback : function(oReturnData, oCallingController) {
			var oModel = new JSONModel();
			
			oModel.setData({businessPartners : oReturnData});
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel);
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
		 * Initializes the model to which the UI controls are bound.
		 */
		initializeSalesOrderModel : function () {
			var oSalesOrderModel = new JSONModel();
			
			oSalesOrderModel.loadData("model/salesOrder/salesOrderCreate.json");
			this.getView().setModel(oSalesOrderModel, "newSalesOrder");
		},
	});
});