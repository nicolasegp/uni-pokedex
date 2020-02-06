$(function() {
	let pid = 0;
	let p_n = $('#p-nombre');
	let p_i = $('img#p-img');
	let p_c = $('#p-captura');
	let p_p = $('#p-peso');
	let p_h = $('#p-habilidades');
	let p_e = $('#p-evoluciones');
	let jrd = $('#json-renderer');
	const jop = {
		collapsed: true, 
		rootCollapsable: false, 
		withQuotes: false, 
		withLinks: false
	};


	$('#p-form').submit(function(e) {
		e.preventDefault();

		pid = $('#p-id').val();
		p_h.html('');
		p_e.html('');
		jrd.text('Cargando...');

		$.ajax({
			method: 'GET',
			url: 'https://pokeapi.co/api/v2/pokemon/' + pid,
			dataType: 'json',
			async: true,
		})
		.done(function(datos) {
			jrd.jsonViewer(datos, jop);
			p_n.text(datos.name);
			p_p.text((datos.weight/10)+ ' Kg');
			p_i.attr('src', datos.sprites.front_default);
			datos.abilities.forEach(H => {
				p_h.append('<li class="text-capitalize">' + H.ability.name + '</li>');
                        });

			$.ajax({
				method: 'GET',
				url: datos.species.url,
				dataType: 'json',
				async: true,
			})
			.done(function(especies) {
				p_c.text(especies.capture_rate);
				$.ajax({
					method: 'GET',
					url: especies.evolution_chain.url,
					dataType: 'json',
					async: true,
				})
				.done(function(evoluciones) {
					let evoChain = [];
					let evoData = evoluciones.chain;

					do {
						let evoDetails = evoData['evolution_details'][0];

						evoChain.push({
							species_name: evoData.species.name,
							min_level: !evoDetails ? 1 : evoDetails.min_level,
							trigger_name: !evoDetails ? null : evoDetails.trigger.name,
							item: !evoDetails ? null : evoDetails.item
						});

						evoData = evoData['evolves_to'][0];
					} while (!!evoData && evoData.hasOwnProperty('evolves_to'));

					evoChain.forEach(evolution => {
						if (evolution.min_level === 1) {
							p_e.append('<li><span class="text-capitalize">' + evolution.species_name + '</span></li>');
						} else {
							if (evolution.trigger_name == 'level-up' && evolution.min_level != null) {
								p_e.append('<li><span class="text-capitalize">' + evolution.species_name + '</span> desde nivel ' + evolution.min_level + '</li>');
							} else if (evolution.trigger_name == 'use-item') {
								p_e.append('<li><span class="text-capitalize">' + evolution.species_name + '</span> con ' + evolution.item.name + '</li>');
							} else if (evolution.trigger_name == 'trade') {
								p_e.append('<li><span class="text-capitalize">' + evolution.species_name + '</span> por intercambio</li>');
							} else {
								p_e.append('<li class="text-capitalize">' + evolution.species_name + '</li>');
							}
						}
					});
				});
			});
		})
		.fail(function() {
			jrd.jsonViewer({error:"No se pudo cargar la API"}, jop);
			p_n.text('?????');
			p_i.attr('src', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png');
		});
	});

});