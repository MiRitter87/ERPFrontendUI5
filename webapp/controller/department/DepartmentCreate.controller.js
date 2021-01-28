sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, JSONModel) {
	"use strict";

	return Controller.extend("ERPFrontendUI5.controller.department.DepartmentCreate", {
		/**
		 * Initializes the controller.
		 */
		onInit : function () {
			//Register an event handler that gets called every time the router navigates to this view.
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("departmentCreateRoute").attachMatched(this._onRouteMatched, this);
			
			this.initializeDepartmentModel();
			//Load all employees. Those are the candidates that can be selected in the head selection ComboBox.
			this.queryEmployeeWebService();
		},
		
		
		/**
		 * Handles the routeMatched-event when the router navigates to this view.
		 */
		_onRouteMatched: function (oEvent) {
			//Query employee data every time a user navigates to this view. This assures that changes are being displayed in the ComboBox.
			this.queryEmployeeWebService();
    	},
		
		
		/**
		 * Handles a click at the save button.
		 */
		onSavePressed : function () {
			if(this.getView().byId("headComboBox").getSelectedKey() == "") {
				this.showMessageOnUndefinedHead();
				return;
			}
			
			this.saveDepartmentByWebService();
		},
		
		
		/**
		 * Handles a click at the cancel button.
		 */
		onCancelPressed : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			
			this.initializeDepartmentModel();
			this.deselectHeadSelection();
			oRouter.navTo("startPageRoute");	
		},
		
		
		/**
		 * Handles the selection of an item in the head of department ComboBox.
		 */
		onHeadSelectionChange : function (oControlEvent) {
			var oSelectedItem = oControlEvent.getParameters().selectedItem;
			var oModel = this.getView().getModel();
			var oDepartmentModel = this.getView().getModel("newDepartment");
			var oEmployees = oModel.oData.employees;
			var oSelectedEmployee;
			
			if(oSelectedItem == null)
				return;
			
			//Get the selected employee from the array of all employees according to the id.
			for(var i = 0; i < oEmployees.data.employee.length; i++) {
    			var oTempEmployee = oEmployees.data.employee[i];
    			
				if(oTempEmployee.id == oSelectedItem.getKey()) {
					oSelectedEmployee = oTempEmployee;
				}
			}
			
			oDepartmentModel.setData({head: oSelectedEmployee}, true);
		},
		
		
		/**
		 * Displays a message in case the head of department has not been selected.
		 */
		showMessageOnUndefinedHead : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			MessageBox.error(oResourceBundle.getText("departmentCreate.noHeadSelected"));
		},
		
		
		/**
		 * Initializes the model to which the UI controls are bound.
		 */
		initializeDepartmentModel : function () {
			var oDepartmentModel = new JSONModel();
			
			oDepartmentModel.loadData("model/department/departmentCreate.json");
			this.getView().setModel(oDepartmentModel, "newDepartment");
		},
		
		
		/**
		 * Queries the employee WebService. If the call is successful, the model is updated with the employee data.
		 */
		queryEmployeeWebService : function() {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/employee");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var oModel = new JSONModel();
			var aData = jQuery.ajax({type : "GET", contentType : "application/json", url : sQueryUrl, dataType : "json", 
				success : function(data,textStatus, jqXHR) {
					var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					oModel.setData({employees : data}); // not aData
					
					if(data.data == null && data.message != null)  {
						MessageToast.show(data.message[0].text);
					}
				},
				context : this
			});                                                                 
			
			this.getView().setModel(oModel);
		},
		
		
		/**
		 * Saves the department defined in the input form by using the RESTful WebService.
		 */
		saveDepartmentByWebService : function () {
			var sWebServiceBaseUrl = this.getOwnerComponent().getModel("webServiceBaseUrls").getProperty("/department");
			var sQueryUrl = sWebServiceBaseUrl + "/";
			var oDepartmentModel = this.getView().getModel("newDepartment");
			var sJSONData = oDepartmentModel.getJSON();
			
			//Use "POST" to create a resource.
			var aData = jQuery.ajax({
				type : "POST", 
				contentType : "application/json", 
				url : sQueryUrl,
				data : sJSONData, 
				success : function(data,textStatus, jqXHR) {
					if(data.message != null) {
						if(data.message[0].type == 'S') {
							MessageToast.show(data.message[0].text);
							this.initializeDepartmentModel();	//Resets the input fields to the initial state.
							this.deselectHeadSelection();
						}
						
						if(data.message[0].type == 'E') {
							MessageBox.error(data.message[0].text);
						}
						
						if(data.message[0].type == 'W') {
							MessageBox.warning(data.message[0].text);
						}
					}
				},
				context : this
			});   
		},
		
		
		/**
		 * Resets the selection of the head of department. No item in the ComboBox is selected afterwards.
		 */
		deselectHeadSelection : function () {
			this.getView().byId("headComboBox").setSelectedItem(null);
		}
	});
});