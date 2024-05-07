sap.ui.define([
	"com/infocus/dataListApplication/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageBox"
], function(BaseController, Filter, FilterOperator, JSONModel, MessageBox) {
	"use strict";

	return BaseController.extend("com.infocus.dataListApplication.controller.Home", {
		onInit: function() {
			var that = this;

			this.oRouter = this.getOwnerComponent().getRouter();

			// call the input parameters data
			this.getLedgerParametersData();
			this.getcompanyCodeParametersData();
			this.getYearParametersData();
			this.getPeriodParametersData();

			// Register a function to be called before rendering the view
			this.getView().attachBeforeRendering(this._validateInputFields, this);

			// Attach liveChange event handlers to input fields
			var inputLedger = this.byId("inputLedger");
			var inputCompanyCode = this.byId("inputCompanyCode");
			var inputFiscalYear = this.byId("inputFiscalYear");
			var inputFromPeriod = this.byId("inputFromPeriod");
			var inputToPeriod = this.byId("inputToPeriod");

			inputLedger.attachLiveChange(this._validateInputFields, this);
			inputCompanyCode.attachLiveChange(this._validateInputFields, this);
			inputFiscalYear.attachLiveChange(this._validateInputFields, this);
			inputFromPeriod.attachLiveChange(this._validateInputFields, this);
			inputToPeriod.attachLiveChange(this._validateInputFields, this);
			// visible & hide column function
			this._columnVisible();

		},
		_validateInputFields: function() {
			var inputLedger = this.byId("inputLedger");
			var inputCompanyCode = this.byId("inputCompanyCode");
			var inputFiscalYear = this.byId("inputFiscalYear");
			var inputFromPeriod = this.byId("inputFromPeriod");
			var inputToPeriod = this.byId("inputToPeriod");

			var ledgerValue = inputLedger.getValue();
			var companyCodeValue = inputCompanyCode.getValue();
			var fiscalYearValue = inputFiscalYear.getValue();
			var fromPeriodValue = inputFromPeriod.getValue();
			var toPeriodValue = inputToPeriod.getValue();

			// Set valueState using ternary operators
			inputLedger.setValueState(ledgerValue === '' ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);
			inputCompanyCode.setValueState(companyCodeValue === '' ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);
			inputFiscalYear.setValueState(fiscalYearValue === '' ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);
			inputFromPeriod.setValueState(fromPeriodValue === '' ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);
			inputToPeriod.setValueState(toPeriodValue === '' ? sap.ui.core.ValueState.Error : sap.ui.core.ValueState.None);

			// Update the global data model
			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/reportS", "PRS");
				oGlobalDataModel.setProperty("/listS", "X");
				oGlobalDataModel.setProperty("/ledgrNo", ledgerValue);
				oGlobalDataModel.setProperty("/cmpnyCode", companyCodeValue);
				oGlobalDataModel.setProperty("/fiscalY", fiscalYearValue);
				oGlobalDataModel.setProperty("/fromP", fromPeriodValue);
				oGlobalDataModel.setProperty("/toP", toPeriodValue);
				oGlobalDataModel.setProperty("/togglePanelVisibility", "X");

				// "X" = Visibility
				// " " = Non - Visibility
			}

			/*this._togglePanelVisibility(oGlobalDataModel.getProperty("/togglePanelVisibility"));*/
		},
		_columnVisible: function() {
			var oColumnVisible = this.getOwnerComponent().getModel("columnVisible");

			var data = {};
			data.glAcct = true;
			data.glAcctLongText = true;
			data.graphColumnVisible = false;
			for (var i = 1; i <= 16; i++) {
				var key = "l" + (i < 10 ? '0' + i : i) + "VFlag";
				data[key] = false;
			}

			oColumnVisible.setData(data);
		},
		_togglePanelVisibility: function(bVisible) {
			var oSplitter = this.byId("splitter");
			var oDynamicTable = this.byId("dynamicTable");
			var oChartPanel = this.byId("chartPanel");

			// Set panel visibility
			/*oChartPanel.setVisible(bVisible);*/

			// Get the content areas of the splitter
			var aContentAreas = oSplitter.getContentAreas();

			// Adjust the size of the chart panel based on visibility
			if (bVisible !== "X") {
				// Panel is visible, adjust size
				aContentAreas[1].setSize("auto"); // Assuming the panel is the second content area
			} else {
				// Panel is hidden, set size to 0
				aContentAreas[1].setSize("0");
			}

			// Set the updated content areas back to the splitter
			oSplitter.setContentAreas(aContentAreas);
		},

		/*************** get parameters data *****************/

		getLedgerParametersData: function() {
			var that = this;
			var parameterModel = this.getOwnerComponent().getModel("parameterModel");
			var pUrl = "/ZLEDGERSet";

			sap.ui.core.BusyIndicator.show();
			parameterModel.read(pUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				success: function(response) {
					var pData = response.results;
					console.log(pData);
					sap.ui.core.BusyIndicator.hide();
					// set the ledger data 
					var oledgerDataModel = that.getOwnerComponent().getModel("ledgerData");
					oledgerDataModel.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);

				}
			});

		},
		getcompanyCodeParametersData: function() {
			var that = this;
			var parameterModel = this.getOwnerComponent().getModel("parameterModel");
			var pUrl = "/ZCOMPANYSet";

			sap.ui.core.BusyIndicator.show();
			parameterModel.read(pUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				success: function(response) {
					var pData = response.results;
					console.log(pData);
					sap.ui.core.BusyIndicator.hide();
					// set the ledger data 
					var ocompanyCodeDataModel = that.getOwnerComponent().getModel("companyCodeData");
					ocompanyCodeDataModel.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
				}
			});

		},
		getYearParametersData: function() {
			var that = this;
			var parameterModel = this.getOwnerComponent().getModel("parameterModel");
			var pUrl = "/ZYEARSet";

			sap.ui.core.BusyIndicator.show();
			parameterModel.read(pUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				success: function(response) {
					var pData = response.results;
					console.log(pData);
					sap.ui.core.BusyIndicator.hide();
					// set the ledger data 
					var oYearDataModel = that.getOwnerComponent().getModel("yearData");
					oYearDataModel.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
				}
			});

		},
		getPeriodParametersData: function() {
			var that = this;
			var parameterModel = this.getOwnerComponent().getModel("parameterModel");
			var pUrl = "/ZPERIODSet";

			sap.ui.core.BusyIndicator.show();
			parameterModel.read(pUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				success: function(response) {
					var pData = response.results;
					console.log(pData);
					sap.ui.core.BusyIndicator.hide();
					// set the ledger data 
					var oPeriodDataModel = that.getOwnerComponent().getModel("periodData");
					oPeriodDataModel.setData(pData);

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
				}
			});

		},

		/*************** set the inputId & create the fragment *****************/

		handleValueLedger: function(oEvent) {
			this._ledgerInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogLedger) {
				this.oOpenDialogLedger = sap.ui.xmlfragment("com.infocus.dataListApplication.view.dialogComponent.DialogLedger", this);
				this.getView().addDependent(this.oOpenDialogLedger);
			}
			this.oOpenDialogLedger.open();
		},
		handleValueCompanyCode: function(oEvent) {
			this._companyCodeInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogComapanyCode) {
				this.oOpenDialogComapanyCode = sap.ui.xmlfragment("com.infocus.dataListApplication.view.dialogComponent.DialogComapanyCode", this);
				this.getView().addDependent(this.oOpenDialogComapanyCode);
			}
			this.oOpenDialogComapanyCode.open();
		},
		handleValueDialogFiscalYear: function(oEvent) {
			this._fiscalYearInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogFiscalYear) {
				this.oOpenDialogFiscalYear = sap.ui.xmlfragment("com.infocus.dataListApplication.view.dialogComponent.DialogFiscalYear", this);
				this.getView().addDependent(this.oOpenDialogFiscalYear);
			}
			this.oOpenDialogFiscalYear.open();
		},
		handleValueDialogFromPeriod: function(oEvent) {
			this._fromYearInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogFromPeriod) {
				this.oOpenDialogFromPeriod = sap.ui.xmlfragment("com.infocus.dataListApplication.view.dialogComponent.DialogFromPeriod", this);
				this.getView().addDependent(this.oOpenDialogFromPeriod);
			}
			this.oOpenDialogFromPeriod.open();
		},
		handleValueDialogToPeriod: function(oEvent) {
			this._toYearInputId = oEvent.getSource().getId();
			// open fragment
			if (!this.oOpenDialogToPeriod) {
				this.oOpenDialogToPeriod = sap.ui.xmlfragment("com.infocus.dataListApplication.view.dialogComponent.DialogToPeriod", this);
				this.getView().addDependent(this.oOpenDialogToPeriod);
			}
			this.oOpenDialogToPeriod.open();
		},

		/*************** search value within fragment *****************/

		_handleValueLedgerSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Rldnr",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueCompanyCodeSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Companycode",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueFiscalYearSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Gjahr",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueFromPeriodSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Monat",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		_handleValueToPeriodSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Monat",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		/*************** set the each property to globalData & reflect data in input field  *****************/

		_handleValueLedgerClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._ledgerInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/ledgrNo", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		_handleValueCompanyCodeClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._companyCodeInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/cmpnyCode", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		_handleValueDialogFiscalYearClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._fiscalYearInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/fiscalY", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		_handleValueDialogFromPeriodClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._fromYearInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/fromP", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		_handleValueDialogToPeriodClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ledgerInput = this.byId(this._toYearInputId);
				var newValue = oSelectedItem.getTitle();
				ledgerInput.setValue(newValue);

				var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
				if (oGlobalDataModel) {
					oGlobalDataModel.setProperty("/toP", newValue);
				}
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		/*************** radio Button selection  *****************/

		onRadioButtonSelectReports: function(oEvent) {
			var radioButtonSelectReport = oEvent.getSource();
			var selectedButtonReport = radioButtonSelectReport.getSelectedButton().getText();

			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/reportS", selectedButtonReport);
			}
		},
		onRadioButtonSelectList: function(oEvent) {
			var radioButtonList = oEvent.getSource();
			var selectedButtonListText = radioButtonList.getSelectedButton().getText();

			var oGlobalDataModel = this.getOwnerComponent().getModel("globalData");
			if (oGlobalDataModel) {
				oGlobalDataModel.setProperty("/listS", selectedButtonListText === "Detailed List" ? 'X' : '');
			}
		},

		/*************** Table column visible on based on flag  *****************/

		_assignVisiblity: function(oData, then) {
			var oColumnVisibleData = then.getOwnerComponent().getModel("columnVisible").getData();
			oColumnVisibleData.glAcct = oData[0].Racct === "" ? false : true;
			oColumnVisibleData.glAcctLongText = oData[0].GlText === "" ? false : true;
			oColumnVisibleData.graphColumnVisible = oData[0].DET_FLAG === "" ? true : false;

			for (var i = 1; i <= 16; i++) {
				var flagKey = "L" + (i < 10 ? '0' + i : i) + "_FLAG";
				var columnKey = "l" + (i < 10 ? '0' + i : i) + "VFlag";
				oColumnVisibleData[columnKey] = oData[0][flagKey] === 'X' ? true : false;
			}

			then.getOwnerComponent().getModel("columnVisible").setData(oColumnVisibleData);
		},

		/*************** get the table data from oData service  *****************/

		getListData: function() {
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			//var oUrl = /ZFI_FCR_SRV/ZFI_FCRSet?$filter=Rldnr eq '0L' and Rbukrs eq '1100' and Ryear eq '2023' and PrctrGr eq 'FTRS' and MinPr eq '03' and MaxPr eq '10' and DET_FLAG eq 'X';
			var oUrl = "/ZFI_FCRSet";
			var ledgrNo = new Filter('Rldnr', FilterOperator.EQ, oGlobalData.ledgrNo);
			var cmpnyCode = new Filter('Rbukrs', FilterOperator.EQ, oGlobalData.cmpnyCode);
			var fiscalY = new Filter('Ryear', FilterOperator.EQ, oGlobalData.fiscalY);
			var reportS = new Filter('PrctrGr', FilterOperator.EQ, oGlobalData.reportS);
			var fromP = new Filter('MinPr', FilterOperator.EQ, oGlobalData.fromP);
			var toP = new Filter('MaxPr', FilterOperator.EQ, oGlobalData.toP);
			var listS = new Filter('DET_FLAG', FilterOperator.EQ, oGlobalData.listS);

			sap.ui.core.BusyIndicator.show();

			oModel.read(oUrl, {
				urlParameters: {
					"sap-client": "400"
				},
				filters: [ledgrNo, cmpnyCode, fiscalY, reportS, fromP, toP, listS],
				success: function(response) {
					var oData = response.results;
					console.log(oData);

					var oListDataModel = that.getOwnerComponent().getModel("listData");
					oListDataModel.setData(oData);

					// check in oData value is available or not 
					if (typeof oData !== 'undefined' && oData.length === 0) {

						// hide the busy indicator
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageBox.information('There are no data available!');
						this._columnVisible();
					} else {
						that._assignVisiblity(oData, that);

						// hide the busy indicator
						sap.ui.core.BusyIndicator.hide();
					}

					// set the data to employeeModel
					/*var oEmployeeModel = that.getOwnerComponent().getModel("employeeData");
					oEmployeeModel.setData(oData);*/

				},
				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					console.log(error);
					var errorObject = JSON.parse(error.responseText);
					sap.m.MessageBox.error(errorObject.error.message.value);
				}
			});

		},
		onChartButtonPress: function(oEvent) {
			var oGlobalData = this.getOwnerComponent().getModel("globalData").getData();
			var oListData = this.getOwnerComponent().getModel("listData").getData();
			var oChartDataModel = this.getOwnerComponent().getModel("chartData");
			var oButton = oEvent.getSource();
			var oColumnListItem = oButton.getParent();
			var oTable = this.byId("dynamicTable");
			var iIndex = oTable.indexOfItem(oColumnListItem);

			var filterChartData = oListData[iIndex];

			var extractChartData = this.extractData(filterChartData);

			oChartDataModel.setData(extractChartData);

			oGlobalData.togglePanelVisibility = oListData[0].DET_FLAG === "" ? "" : "X";

			this.getOwnerComponent().getModel("globalData").setData(oGlobalData);
		},

		extractData: function(obj) {
			var result = [];
			var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			
			var oVizFrame = this.byId("oVizFrame");
			oVizFrame.setVizProperties({
              title: {
                visible: true,
                text: obj.GlAcGroup
              }
            });

			// Add total value from the object to the result array
			if (obj.Total) {
				result.push({
					Month: 'Total',
					Value: obj.Total
				});
			}

			for (var i = 1; i <= 16; i++) {
				var flagKey = "L" + (i < 10 ? '0' + i : i) + "_FLAG";
				var flag = obj[flagKey];
				var monthIndex = i - 1 < 9 ? i + 3 : i - 9;
				var month = months[monthIndex - 1] || 'Total';
				var valueKey = i < 10 ? "L0" + i : "L" + i;
				var value = obj[valueKey];

				if (flag === "X") {
					result.push({
						Month: month,
						Value: value
					});
				}
			}

			return result;
			
		},

		onDownloadPDF: function() {
			// Create a new jsPDF instance
			var doc = new jsPDF();

			// Define table columns and rows
			var columns = ["G/L Acct", "G/L Acct Long Text", "G/L Group", "Total", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov",
				"Dec", "Jan", "Feb", "Mar", "Specl 1", "Specl 2", "Specl 3", "Specl 4"
			];
			var rows = [];

			// Get table reference
			var table = this.byId("dynamicTable");

			// Get table items (data)
			var items = table.getItems();

			// Loop through table items to extract data
			items.forEach(function(item) {
				var cells = item.getCells();
				var rowData = [];
				cells.forEach(function(cell) {
					rowData.push(cell.getText());
				});
				rows.push(rowData);
			});

			// Add table to PDF
			doc.autoTable(columns, rows);

			// Save PDF
			doc.save("table_data.pdf");
		}

	});
});