var mongoose    = require('mongoose');
var async       = require('async');
var LineByLine  = require('line-by-line');
var Course      = require('../models/course');
var Discipline  = require('../models/discipline');
var Offering    = require('../models/offering');
var Catalog     = require('../models/catalog');
var Modality    = require('../models/modality');
var Block       = require('../models/block');
var Requirement = require('../models/requirement');

mongoose.connect("mongodb://localhost/courses");

async.series([function (next) {
    console.log('saving courses...');
    async.each(read_file("../db/arquivos/CursoCatalogo.csv"), function (line, next) {
        Course.update({'code' : (line[1] || '')}, {
            'code'  : (line[1] || ''),
            'name'  : (line[3] || '').trim(),
            'level' : (line[2] || '')
        }, {'upsert' : true}, next);
    }, next);    
}, function (next) {
    async.series([function (next) {
        console.log('saving disciplines...');
        async.each(read_file("../db/arquivos/CadastroDisciplinas.csv"), function (line, next) {
            Discipline.update({'code' : line[0]}, {
                'code'       : line[0],
                'name'       : line[2].trim(),
                'department' : line[4],
                'credits'    : 0,
                'requirements' : []
            }, {'upsert' : true}, next);
        }, next);
    }, function (next) {
        console.log('-> saving unities...');
        async.each(read_file("../db/arquivos/CadastroUnidades.csv"), function (line, next) {
            var query = Discipline.find();
            query.where('department', line[0]);
            query.exec(function (error, queries) {
                async.each(queries, function (disc, next) {
                    Discipline.update({'code' : disc.code}, {'department' : line[1].trim()}, next);
                }, next);
            }, next);
        }, next);
    }, function (next) {
        console.log('-> saving descriptions...');
        async.each(read_file("../db/arquivos/EmentaDisciplinas.csv"), function (line, next) {
            Discipline.update({'code' : line[0]}, {'description' : (line[2] || '')}, next);
        }, next);
    }, function (next) {
        console.log('-> saving credits...');
        async.each(read_file("../db/arquivos/CargaHorariaDisciplinasCatalogo.csv"), function (line, next) {
            Discipline.update({'code' : line[1]}, {'credits' : (line[3] || '')}, next);
        }, next);
    }, function (next) {
        console.log('-> saving requirements...');
        async.each(read_file("../db/arquivos/PreRequisito.csv"), function (line, next) {
            if (line[3] !== '') return next();
            if (line[4] === '') return next();
            var query = Discipline.find();
            query.where('code').in(line[4].split(/[\s\s|\*|\/]/));
            query.exec(function (error, ids) {
                Discipline.update({'code' : line[0]}, {'requirements' : ids.map(function (disc) {
                    return disc._id;
                })}, next);
            });
        }, next);
    }], next);
}, function (next) {
    async.series([function (next) {
        console.log('saving offerings...');
        async.each(read_file("../db/arquivos/DisciplinasTurmasOferecidas.csv"), function (line, next) {
            var query = Discipline.find();
            query.where('code', line[3]);
            query.exec(function (error, ids) {
                Offering.update({'code' : line[3], 'class' : line[5].trim()}, {
                    'code'          : line[3],
                    'year'          : line[0], 
                    'period'        : line[1],
                    'class'         : line[5].trim(),
                    'vacancy'       : line[8],
                    'schedules'     : [],
                    'discipline'    : ids.map(function (discipline) {
                        return discipline._id;
                    })
                }, {'upsert' : true}, next);
            });
        }, next);
     }, function (next) {
        console.log('-> saving schedules...');
        async.each(read_file("../db/arquivos/HorarioDisciplinasTurmasOferecidas.csv"), function (line, next) {
            Offering.update({'code' : line[3], 'class' : line[5].trim()}, {
                $push : {'schedules'  : {
                    'weekday'   : line[6], 
                    'hour'      : parseInt(line[7]), 
                    'room'      : line[8].trim()
                }}
            }, {'upsert' : true}, next);
        }, next);
    }], next);
}, function (next) {
    async.series([function (next) {
        console.log('saving catalogs...');
        async.each(read_file("../db/arquivos/CursoCatalogo.csv"), function (line, next) {
            Catalog.update({'year' : line[0]}, {
                'year' : line[0]
            }, {'upsert' : true}, next);
        }, next);
     }], next); 
}, function (next) {
    async.series([function (next) {
        console.log('saving modalities...');
        async.each(read_file("../db/arquivos/CursoHabilitacaoCatalogo.csv"), function (line, next) {
            var query = Catalog.find();
            query.where('year', line[0]);
            query.exec(function (error, ids) {
                var catalogId = ids.map(function (catalog) { return catalog._id; });
                Modality.update({'courseCode' : line[1], 'code' : (line[3].trim() || 'SM'), 'catalog' : catalogId}, {
                    'code'          : (line[3].trim() || 'SM'),
                    'name'          : (line[4].trim() || 'Sem Modalidade'),
                    'courseCode'    : line[1],
                    'catalog'       : catalogId
                }, {'upsert' : true});
            
                var query2 = Course.find();
                query2.where('code', line[1]);
                query2.exec(function (error, coursesId) {
                    Modality.update({'courseCode' : line[1], 'code' : (line[3].trim() || 'SM'), 'catalog' : catalogId}, {
                        'code'          : (line[3].trim() || 'SM'),
                        'name'          : (line[4].trim() || 'Sem Modalidade'),
                        'courseCode'    : line[1],
                        'course' : coursesId.map(function (course) { return course._id; })
                    }, {'upsert' : true}, next);
                });
            });
        }, next);
    }], next);
}, function (next) {
    async.series([function (next) {
        console.log('saving blocks 1...');
        async.each(read_file("../db/arquivos/CurriculoEletivoComum.csv"), function (line, next) {
            var query = Catalog.find();
            query.where('year', line[0]);
            query.exec(function (error, ids) {
                var catalogId = ids.map(function (catalog) { return catalog._id; });
                var query2 = Modality.find();
                query2.where({'courseCode' : line[1], 'catalog' : catalogId});
                query2.exec(function (error, modalities) {
                    async.each(modalities, function (mod, next) {
                        Block.update({'modality' : mod._id, 'code' : line[3]}, {
                            'code'          : line[3],
                            'type'          : "Eletivas Comuns",
                            'credits'       : line[4],
                            'modality'      : mod._id
                        }, {'upsert' : true}, function (error) {
                            var query3 = Block.find();
                            query3.where({'modality' : mod._id, 'code' : line[3]});
                            query3.exec(function (error, blocks) {
                                var blockId = blocks.map(function (blck) { return blck._id; });
                                if(line[5].slice(4) == '-'){
                                    Requirement.update({'block' : blockId, 'code' : line[5]}, {
                                        'code'              : line[5],
                                        'block'             : blockId,
                                        'mask'              : line[5]
                                    }, {'upsert' : true}, next);
                                } else {
                                    var query4 = Discipline.find();
                                    query4.where('code', line[5]);
                                    query4.exec(function (error, disciplines) {
                                        Requirement.update({'block' : blockId, 'code' : line[5]}, {
                                            'code'              : line[5],
                                            'block'             : blockId,
                                            'discipline'        : disciplines.map(function (disc) {return disc._id;})
                                        }, {'upsert' : true}, next);
                                    });
                                }
                            });
                        }, next);
                    }, next);
                });
            });
        }, next);
    },  function (next) {
        console.log('saving blocks 2...');
        async.each(read_file("../db/arquivos/Curriculo_Obrigatorias_comuns.csv"), function (line, next) {
            var query = Catalog.find();
            query.where('year', line[0]);
            query.exec(function (error, ids) {
                var catalogId = ids.map(function (catalog) { return catalog._id; });
                var query2 = Modality.find();
                query2.where({'courseCode' : line[1], 'catalog' : catalogId});
                query2.exec(function (error, modalities) {
                    async.each(modalities, function (mod, next) {
                        Block.update({'modality' : mod._id, 'code' : 10}, {
                            'code'          : 10,
                            'type'          : "Obrigatórias Comuns",
                            'modality'      : mod._id
                        }, {'upsert' : true}, function (error) {
                            var query3 = Block.find();
                            query3.where({'modality' : mod._id, 'code' : 10});
                            query3.exec(function (error, blocks) {
                                var blockId = blocks.map(function (blck) { return blck._id; });
                                var query4 = Discipline.find();
                                query4.where('code', line[3]);
                                query4.exec(function (error, disciplines) {
                                    Requirement.update({'block' : blockId, 'code' : line[3]}, {
                                        'code'              : line[3],
                                        'block'             : blockId,
                                        'discipline'        : disciplines.map(function (disc) {return disc._id;})
                                    }, {'upsert' : true}, next);
                                });
                            });
                        }, next);
                    }, next);
                });
            });
        }, next);
    }, function (next) {
        console.log('saving blocks 3...');
        async.each(read_file("../db/arquivos/CurriculoEletivoEspecifico.csv"), function (line, next) {
            var query = Catalog.find();
            query.where('year', line[0]);
            query.exec(function (error, ids) {
                var catalogId = ids.map(function (catalog) { return catalog._id; });
                var query2 = Modality.find();
                query2.where({'code' : line[3], 'courseCode' : line[1], 'catalog' : catalogId});
                query2.exec(function (error, modalities) {
                    if(modalities.length == 0) return next();
                    Block.update({'modality' : modalities[0]._id, 'code' : line[4]+'00'}, {
                        'code'          : line[4]+'00',
                        'type'          : "Eletivas Específicas",
                        'credits'       : line[5],
                        'modality'      : modalities[0]._id
                    }, {'upsert' : true}, function (error) {
                        var query3 = Block.find();
                        query3.where({'modality' : modalities[0]._id, 'code' : line[4]+'00'});
                        query3.exec(function (error, blocks) {
                            var blockId = blocks.map(function (blck) { return blck._id; });
                            if(line[6].slice(4) == '-' || line[6].slice(2, -2) == '-' || line[6].slice(0, -4) == '-'){
                                Requirement.update({'block' : blockId, 'code' : line[6]}, {
                                    'code'              : line[6],
                                    'block'             : blockId,
                                    'mask'              : line[6]
                                }, {'upsert' : true}, next);
                            } else {
                                var query4 = Discipline.find();
                                query4.where('code', line[6]);
                                query4.exec(function (error, disciplines) {
                                    Requirement.update({'block' : blockId, 'code' : line[6]}, {
                                        'code'              : line[6],
                                        'block'             : blockId,
                                        'discipline'        : disciplines.map(function (disc) {return disc._id;})
                                    }, {'upsert' : true}, next);
                                });
                            }
                        });
                    }, next);
                });
            });
        }, next);
    }, function (next) {
        console.log('saving blocks 4...');
        async.each(read_file("../db/arquivos/Curriculo_Obrigatorio_Especifico.csv"), function (line, next) {
            var query = Catalog.find();
            query.where('year', line[0]);
            query.exec(function (error, ids) {
                var catalogId = ids.map(function (catalog) { return catalog._id; });
                var query2 = Modality.find();
                query2.where({'code' : line[3], 'courseCode' : line[1], 'catalog' : catalogId});
                query2.exec(function (error, modalities) {
                    if(modalities.length == 0) return next();
                    Block.update({'modality' : modalities[0]._id, 'code' : 1000}, {
                        'code'          : 1000,
                        'type'          : "Obrigatórias Específicas",
                        'modality'      : modalities[0]._id
                    }, {'upsert' : true}, function (error) {
                        var query3 = Block.find();
                        query3.where({'modality' : modalities[0]._id, 'code' : 1000});
                        query3.exec(function (error, blocks) {
                            var blockId = blocks.map(function (blck) { return blck._id; });
                            var query4 = Discipline.find();
                            query4.where('code', line[4]);
                            query4.exec(function (error, disciplines) {
                                Requirement.update({'block' : blockId, 'code' : line[4]}, {
                                    'code'              : line[4],
                                    'block'             : blockId,
                                    'discipline'        : disciplines.map(function (disc) {return disc._id;})
                                }, {'upsert' : true}, next);
                            });
                        });
                    }, next);
                });
            });
        }, next);
     }, function (next) {
        console.log('-> saving suggested semester...');
        async.each(read_file("../db/arquivos/SugestaoParaCumprimentoCurriculo2.csv"), function (line, next) {
            if(line[7].slice(4) == ' ') return next();
            var query = Catalog.find();
            query.where('year', line[0]);
            query.exec(function (error, ids) {
                var catalogId = ids.map(function (catalog) { return catalog._id; });
                var query2 = Modality.find();
                query2.where({'code' : (line[3].trim() || 'SM'), 'courseCode' : line[1], 'catalog' : catalogId});
                query2.exec(function (error, modalities) {
                    if(modalities.length == 0) return next();
                    var query3 = Block.find();
                    query3.where({'modality' : modalities[0]._id});
                    query3.exec(function (error, blocks) {
                        async.each(blocks, function (blk, next) {
                            var query4 = Discipline.find();
                            query4.where('code', line[7]);
                            query4.exec(function (error, disciplines) {
                                Requirement.update({'block' : blk._id, 'code' : line[7]}, {
                                    'code'              : line[7],
                                    'block'             : blk._id,
                                    'discipline'        : disciplines.map(function (disc) {return disc._id;}),
                                    'suggestedSemester' : line[4]+line[5]
                                }, next);
                            });
                        }, next);
                    });
                });
            });
        }, next);
    }], next);
}], function (error) {
    if(error) console.error(error);
    process.exit();
});

function read_file(file){
    var fs = require("fs"); 
    var dados = [];
    var texto = fs.readFileSync(file, 'utf-8');
    var linha = texto.split("\n");
    for(var i=1;i<linha.length;i++){
        var valor = linha[i].split(/[;|,]/);
        var tamValor = valor.length;
        if(tamValor > 0){
            valor[tamValor-1] = valor[tamValor-1].slice(0,-1)
            dados.push(valor);
        }
    }
    return dados;
}