sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./AccountController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, AccountController, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.account.AccountEdit", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter;
			
			//Register an event handler that gets called every time the router navigates to this view.
			oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("accountEditRoute").attachMatched(this._onRouteMatched, this);
			
			AccountController.initializeCurrencyComboBox(this.getView().byId("currencyComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			AccountController.queryAccountsByWebService(this.queryAccountsCallback, this, true);
			this.getView().setModel(null, "selectedAccount");
			this.resetUIElements();
    	},


		/**
		 * Handles the selection of an item in the purchase order ComboBox.
		 */
		onAccountSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oAccountsModel = this.getView().getModel("accounts");
			var oAccount, oAccountModel;
			
			if(oSelectedItem == null) {
				this.resetUIElements();
				return;
			}
				
			oAccount = AccountController.getAccountById(oSelectedItem.getKey(), oAccountsModel.oData.account);
			oAccountModel = new JSONModel();
			oAccountModel.setData(oAccount);
			
			//Set the model of the view according to the selected account to allow binding of the UI elements.
			this.getView().setModel(oAccountModel, "selectedAccount");
			
			//Manually set the balance of the Input field because the balance is not directly bound due to validation reasons.
			this.setBalanceInputValue(oAccount.balance);
		},


		/**
		 * Callback function of the queryPurchaseOrders RESTful WebService call in the PurchaseOrderController.
		 */
		queryAccountsCallback : function(oReturnData, oCallingController, bShowSuccessMessage) {
			var oModel = new JSONModel();
			var oResourceBundle = oCallingController.getOwnerComponent().getModel("i18n").getResourceBundle();
			
			if(oReturnData.data != null) {
				oModel.setData(oReturnData.data);
				
				if(bShowSuccessMessage == true)
					MessageToast.show(oResourceBundle.getText("accountEdit.dataLoaded"));			
			}
			
			if(oReturnData.data == null && oReturnData.message != null)  {
				MessageToast.show(oReturnData.message[0].text);
			}                                                               
			
			oCallingController.getView().setModel(oModel, "accounts");
		},


		/**
		 * Resets the UI elements to the initial state.
		 */
		resetUIElements : function () {
			this.getView().byId("accountComboBox").setSelectedItem(null);
			
			this.getView().byId("idText").setText("");
			this.getView().byId("descriptionTextArea").setValue("");
			
			this.getView().byId("balanceInput").setValue(0);
			this.getView().byId("balanceInput").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("currencyComboBox").setSelectedItem(null);
		},
		
		
		/**
		 * Sets the value of the balanceInput.
		 */
		setBalanceInputValue : function(fValue) {
			this.getView().byId("balanceInput").setValue(fValue);
			this.getView().byId("balanceInput").setValueState(sap.ui.core.ValueState.None);
		},
	});
});