define([
    'util/dom',
    'widgets/dialog',
    'text!fragments/create-workout-dialog.html',
    'domain/Workout'
], /** @exports workouts */ function (
    dom,
    dialog,
    template,
    Workout
) {

    dom('[data-action="start"]').on('click', function (e) {
        var workout = new Workout();

        dialog(workout, 'Create Workout')
            .buttons(
                {text: 'Cancel', action: 'cancel'},
                {text: 'Start', action: 'start'}
            )
            .showModal(template)
            .on('start', function (e) {
                workout.start().then(
                    console.log.bind(console),
                    function () {
                        dialog.alert('Must select at least one muscle group in order to create a workout.');
                    }
                )
            });
    });

});
