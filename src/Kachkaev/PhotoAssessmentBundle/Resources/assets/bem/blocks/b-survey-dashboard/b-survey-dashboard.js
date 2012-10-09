/**
 * Displays the survey queue and allows selecting different photos
 * 
 * Update queue: $elem.bsurveydashboard('updateItems', queue, currentId);
 * 
 * Events:
 * changeitem(id) — when non-current item is clicked
 */
$.widget('ui.bsurveydashboard', {

	_init: function() {
		var w = {
				_self: this,
				$element: this.element,
			};
		this.w = w;
		
		w.$hint = w.$element.find(".b-survey-dashboard__hint");
		w.$items = w.$element.find(".b-survey-dashboard__items");
		w.itemsMap = {};
		w.currentId = null;
		w.$currentItem = null;

		w.$dashboardHint = $('.b-survey-dashboard__hint');

		// Trigger changeitem when an item is clicked
		$(".b-survey-dashboard__item").live("click", function(e) {
			var $this = $(this);
			var id = $this.data("id");
			if ($this.hasClass("current"))
				return;
			if ($this.hasClass("unanswered")) {
				var $prevUnanswered = $this.prevAll().filter(".unanswered");
				if ($prevUnanswered.size()) {
					str = "Please submit you answers on previous photographs to see the selected one.";
					w.$dashboardHint.stop(true, true).text(str).fadeIn(0).delay(2000).fadeOut(2000);
					id = $prevUnanswered.last().data("id");
				};
			}
			w._self.setCurrentItemId(id);
			return;
		});
	},

	/** Converts queue to items and displays them
	 */
	updateItems: function(queue, currentId) {
		var w = this.w;

		w.$items.detach();

		// Collecting all "ids" of items
		var deletedIds = {};
		w.$items.find(".b-survey-dashboard__item").each(function() {
			deletedIds[$(this).data("id")] = true;
		});
		
		// Looping through queue and updating/adding items
		var $prevItem = null;
		$.each(queue, function(k, v) {
			
			// Creating an item if it does not exist
			var $currentItem = w.itemsMap[v.id];
			if (!$currentItem) {
				$currentItem = $('<li class="b-survey-dashboard__item"></li>');
				$currentItem.data("id", v.id);
				w.itemsMap[v.id] = $currentItem;
			}
			// Placing current item
			if ($prevItem)
				$currentItem.insertAfter($prevItem);
			else
				$currentItem.prependTo(w.$items);
			
			// Assigning classes to the item
			$currentItem.removeClass('incomplete complete').addClass(pat.PhotoResponseStatus.valueToString(v.status, true));
			if (v.id == currentId)
				$currentItem.addClass("current");

			delete deletedIds[v.id];
			$prevItem = $currentItem;
		});
		
		// Looking for items in dashboard but not in queue and deleting them (just in case)
		$.each(deletedIds, function(id) {
			if (!w.itemsMap[id])
				return;
			w.itemsMap[id].remove();
			delete w.itemsMap[id];
		});
		
		w.$items.prependTo(w.$element);			
	},
	
	setCurrentItemId: function(newId) {
		var w = this.w;
		

		if (newId == w.currentId)
			return false;
		
		if (w.$currentItem)
			w.$currentItem.removeClass('current');
		var $newCurrentItem = w.itemsMap[newId];
		
		if (!$newCurrentItem)
			return false;
		
		$newCurrentItem.addClass('current');
		w.currentId = newId;
		w.$currentItem = $newCurrentItem;
		w._self._trigger("changeitem", 0, newId);
	}
});