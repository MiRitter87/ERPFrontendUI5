sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./AccountController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, AccountController, JSONModel, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.account.AccountCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			var oRouter;
			
			//Register an event handler that gets called every time the router navigates to this view.
			oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("accountCreateRoute").attachMatched(this._onRouteMatched, this);
			
			AccountController.initializeCurrencyComboBox(this.getView().byId("currencyComboBox"), 
				this.getOwnerComponent().getModel("i18n").getResourceBundle());
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function () {
			this.resetFormFields();
			this.initializeAccountModel();
    	},


		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			//Validate balance first to remove the error indication from the input field as soon as possible if the user fills in correct data.
			AccountController.validateBalanceInput(this.getView().byId("balanceInput"), this.getOwnerComponent().getModel("i18n").getResourceBundle(),
				this.getView().getModel("newAccount"), "/balance");
				
			if(this.getView().byId("currencyComboBox").getSelectedKey() == "") {
				this.showMessageOnUndefinedCurrency();
				return;
			}
			
			if(AccountController.isBalanceValid(this.getView().byId("balanceInput").getValue()) == false)
				return;				
			
			AccountController.createAccountByWebService(this.getView().getModel("newAccount"), this.saveAccountCallback, this);
		},
		
		
		/**
		 * Callback function of the saveAccount RESTful WebService call in the AccountController.
		 */
		saveAccountCallback : function (oReturnData, oCallingController) {
			if(oReturnData.message != null) {
				if(oReturnData.message[0].type == 'S') {
					MessageToast.show(oReturnData.message[0].text);
					oCallingController.resetFormFields();
					oCallingController.initializeAccountModel();
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
		 * Displays a message in case the currency has not been selected.
		 */
		showMessageOnUndefinedCurrency : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("accountCreate.noCurrencySelected"));
		},


		/**
		 * Initializes the account model to which the UI controls are bound.
		 */
		initializeAccountModel : function () {
			var oAccountModel = new JSONModel();
			
			oAccountModel.loadData("model/account/accountCreate.json");
			this.getView().setModel(oAccountModel, "newAccount");
		},


		/**
		 * Resets the form fields to the initial state.
		 */
		resetFormFields : function () {
			this.getView().byId("balanceInput").setValue(0);
			this.getView().byId("balanceInput").setValueState(sap.ui.core.ValueState.None);
			this.getView().byId("currencyComboBox").setSelectedItem(null);
		}
	});
});