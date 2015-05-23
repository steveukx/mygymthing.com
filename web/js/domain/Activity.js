define([
], function (
) {

    'use strict';

    /**
     * The Activity is used to describe a particular exercise in any given Workout,
     * it can store the name of the activity along with the timing for Cardio or the
     * reps/sets/resistance for weights.
     *
     * @name Activity
     * @constructor
     */
    function Activity (name) {
        this.name = name;
    }

    return Activity;

});
