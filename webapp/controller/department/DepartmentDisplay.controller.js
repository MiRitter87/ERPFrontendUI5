sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.department.DepartmentDisplay", {
		/**
		 * Initializes the Controller.
		 */
		onInit : function () {			
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("departmentDisplayRoute").attachMatched(this._onRouteMatched, this);
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function (oEvent) {
			//Query department data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			this.queryDepartmentWebService();
			this.getView().byId("departmentComboBox").setSelectedItem(null);
    	},


		/**
		 * Handles the selection of an item in the employee ComboBox.
		 */
		onDepartmentSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oModel = this.getView().getModel();
			var oDepartments = oModel.oData.departments;
			var oDepartment;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected department from the array of all departments according to the code.
			for(var i = 0; i < oDepartments.data.department.length; i++) {
    			var oTempDepartment = oDepartments.data.department[i];
    			
				if(oTempDepartment.code == oSelectedItem.getKey()) {
					oDepartment = oTempDepartment;
				}
			}
			
			//Set the model of the view according to the selected department to allow binding of the UI elements.
			oModel.setData({departments:oDepartments, selectedDepartment : oDepartment});
		},


		/**
		 * Queries the department WebService. If the call is successful, the model is updated with the department data.
		 */
		queryDepartmentWebService : function() {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/department");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var oModel = new JSONModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : sQueryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({departments : data}); // not aData
					
					if(data.data != null) {
						MessageToast.show(oResourceBundle.getText("departmentDisplay.dataLoaded"));
					}
					else {
						if(data.message != null)
							MessageToast.show(data.message[0].text);
					}
				},
				context : this
			});                                                                 
			
			this.getView().setModel(oModel);
		}
	});
});