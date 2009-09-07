/*
* jQuery CardWall Plugin
* version: 0.7 (September 07, 2009)
* @requires jQuery v1.3.2 or later
* @requires jQuery-UI v1.7.2 or later
* @requires jQuery Form plugin
*
* Examples and documentation at: http://loonyb.in/
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*/

jQuery.fn.cardwall = function (sectionHeading, options) {
	return this.each( function() {
		$table = $(this);
		$wall = $("<div id='wall'></div>");
		settings = $.extend({
			sections : [],
			controller : '',
			callback : function (data, textStatus) {this;},
		}, options);
		
		/*
		 * 1. index the headers
		 * 2. get sections by unique values in a column
		 * 3. create sections, make sortable and append to wall
		 * 4. create cards from table rows
		 * 5. add cards to sections
		 * 6. add new button and modal form
		 * 7. add trash/archive section
		 */

		var header = {}
		// 1. index the headers
		$('thead th', $table).each( function(i){
			header[$(this).text()]=i+1;
		});

		var colSelector = function (colName) {
			return ' td:nth-child('+ header[colName] +')';
		};

		// 2. get sections by unique values in a column
		var sections = {};
		if(settings.sections.length) {
			settings.sections.forEach(function(name){
				sections[name]=1;
			});
		} else {
			$('tbody' + colSelector(sectionHeading), $table).each( function(){
				sections[$(this).text()] = 1;
			});
		};

		// 3. create sections and append to wall
		for (name in sections) {
			sections[name] = $("<div id='"+name+"' class='section'></div>")
				.appendTo($wall)
				.sortable({
					connectWith: '.section',
					cursor: 'crosshair',
					receive: function(event, ui){
						var id = ui.item[0].id.substring(1);
						var url = settings.controller + "update/" + id;
						var data = {};
						data[sectionHeading] = event.target.id;
						$.get(url, data, settings.callback);
					},
			//		update: logger,

				});
		}

		// 4. create cards from table rows
		$('tbody tr', $table).each(function(i){
			$row = $(this);
			var id = $row.id || i;
			//$title = $("<div class='title'>"+$(colSelector(settings.title),$row).text()+"</div>");
			
			$dl=$("<dl></dl>");
			for (prop in header) {
				$dl.append($("<dt>"+prop+"</dt>").addClass(prop))
				  .append($("<dd>"+$(colSelector(prop),$row).text()+"</dd>").addClass(prop));
			};

			$more=$("<div></div>").addClass("more").html("<a href='#'>more &gt;&gt;&gt;</a>");

			$card = $("<div id='c"+id+"' class='card'></div>")
			//	.append($title)
				.append($dl)
				.append($more)
				.appendTo(sections[$(colSelector(sectionHeading), $row).text()]);
		});
		$table.replaceWith($wall);	
		
		// 6. add create new modal form and button
		var $fieldset =	$("<fieldset></fieldset>");
		for (prop in header) {
			$fieldset.append($("<label for='"+prop+"'>"+prop+"</label>"))
				.append($("<input type='text' name='"+prop+"' id='new-"+prop+"' class='text ui-widget-content ui-corner-all' />"));
		};
		var $form = $("<form id='new-form'></form>").append($fieldset).appendTo($wall).dialog({
				autoOpen : false,
				modal : true,
				buttons: {
					'Create New' : function() {
						$(this).ajaxSubmit({
							url: settings.controller+'create',
							clearform: 'True',
						}).dialog('close');
					},
					'close' : function() {
						$(this).clearForm().dialog('close');
					},
				},
			});

		$("<button id='create-new' class='ui-button ui-state-default ui-corner-all'>Create New</button>")
			.click(function() {
				$form.dialog('open');
			})
			.appendTo($wall);
		
	});
};
