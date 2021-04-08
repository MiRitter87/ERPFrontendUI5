sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment"
], function (Controller, Fragment) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.salesOrder.SalesOrderCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
						
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
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});
		},


		/**
		 * Handles the closing of the new item Dialog.
		 */
		onSaveDialog : function () {
			this.byId("newItemDialog").close();
		},

		
		/**
		 * Handles the closing of the new item Dialog.
		 */
		onCancelDialog : function () {
			this.byId("newItemDialog").close();
		}
	});
});