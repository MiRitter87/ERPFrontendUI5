sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./AccountController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
], function (Controller, AccountController, JSONModel, MessageToast, MessageBox) {
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
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				
			if(this.getView().byId("accountComboBox").getSelectedKey() == "") {
				AccountController.showMessageBoxError(oResourceBundle, "accountEdit.noAccountSelected");
				return;
			}
			
			//Validate balance first to remove the error indication from the input field as soon as possible if the user fills in correct data.
			AccountController.validateBalanceInput(this.getView().byId("balanceInput"), oResourceBundle, this.getView().getModel("selectedAccount"), "/balance");
			
			if(this.getView().byId("currencyComboBox").getSelectedKey() == "") {
				AccountController.showMessageBoxError(oResourceBundle, "accountEdit.noCurrencySelected");
				return;
			}
			
			if(AccountController.isBalanceValid(this.getView().byId("balanceInput").getValue()) == false)
				return;
				
			AccountController.saveAccountByWebService(this.getView().getModel("selectedAccount"),
				this.saveAccountCallback, this);
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			oRouter.navTo("startPageRoute");	
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
		 *  Callback function of the saveAccount RESTful WebService call in the AccountController.
		 */
		saveAccountCallback : function(oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					//Update the data source of the ComboBox with the new account data.
					AccountController.queryAccountsByWebService(oCallingController.queryAccountsCallback, oCallingController, false);
					//Clear selectedAccount because no ComboBox item is selected.
					oCallingController.getView().setModel(null, "selectedAccount");
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