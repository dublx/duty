// to avoid cyclic dependency issues,
//   it is important to avoid require duty.js and extending
//   the below class with DutyTodo class
const colors = require('colors');
class ReadTodo {
    constructor() {}
    static createType() {
	return new ReadTodo();
    }
    static UNICODE_VALUES() {
	const bold = colors.bold;
	return {
	    checkmark: bold("\u2714".green),
	    ballot: bold("\u2718".red),
	    critical: bold("\u25CF".red),
	    notcritical: bold("\u25D0".green),
	    critical: bold("\u2762".red),
	    notcritical: bold("\u2762".green),
	    circle: bold("\u25CF".red),
	    halfcircle: bold('\u25CB'.green),
	    completecircle: bold("\u25CF".green)
	};
    }
    static HANDLE_DUE_DATE({due_date}) {

	let _date = new Date();

	_date = _date.toLocaleDateString().split('/').join('');

	due_date = due_date.split('/').join('');

	const TIME_LEFT = String((due_date - _date)).replace(/0+$/,'');

	const { circle, halfcircle, completecircle } = ReadTodo.UNICODE_VALUES();

	if ( due_date > _date ) {
	    return `${TIME_LEFT}days from now${halfcircle}`;
	} else if ( due_date < _date ) {
	    return `${parseInt(TIME_LEFT) * -1}days before now${circle}`;
	} else if ( due_date === _date ) {
	    return `today ${completecircle}`;
	}

    }
    static HANDLE_PRIORITY(priority) {
	return ((priority === 'critical') ?  'critical' : 'notcritical');
    }

    static STYLE_READ(opt,DutyTodo) {

	let {
	    hash,
	    content,
	    completed,
	    date,
	    modifiedDate,
	    due_date,
	    priority,
	    urgency,
	    category,
	    note
	} = opt;

	let unicodes = ReadTodo.UNICODE_VALUES();

	DutyTodo.PRINT(`

hash:\t\t${hash}  ${completed ? unicodes.checkmark : unicodes.ballot}
creation date:\t${date} ${modifiedDate ? `
modified date:\t${modifiedDate}` : ''} ${due_date ? `
due date:\t${ReadTodo.HANDLE_DUE_DATE({due_date})}` : ''}${category ? `
category:\t(${category})` : ''} ${priority ? `
priority:\t${priority}${unicodes[ReadTodo.HANDLE_PRIORITY(priority)]}` : ''} ${urgency ? `
urgency:\t${urgency} `: ''} ${note ? `
note:\t\t${note}`: ''}
content:\t${content}\n
`);

    }
    handleRead({type,opt,self: _this,DutyTodo}) {
	let { m } = _this.MANAGER;
	this.type = type;
	this.DutyTodo = DutyTodo;
	this.m = m ;
	this._this = _this;
	this._opt = opt;

	let _matched = this.type.match(/^(urgency|category):([a-z]+)$/);
	const [,_type,_typeOfType] = _matched ? _matched : [,undefined,undefined];

	if ( _typeOfType ) {
	    this[_type](_typeOfType);
	    return ;
	}

	this[this.type]();
    }
    all() {

	let { DutyTodo, _this, m } = this;

	DutyTodo.CALLGENERATORYLOOP(_this, ({hash}) => {
	    ReadTodo.STYLE_READ(m[hash],DutyTodo);
	});
    }
    due() {
	let { DutyTodo, _this, m } = this,
	    { date: _dueDate} = this._opt, j = 0,
	    cb = ({hash,due_date}) => {
		j++;
		if ( due_date && _dueDate === due_date ) {
		    ReadTodo.STYLE_READ(m[hash],DutyTodo);
		    return true;
		}
		if ( Object.keys(m).length === j ) {
		    return false;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(_this,cb)
	    .catch( _ => {
		process.stdout.write(`specified due date was not found\n`);
	    });

    }
    category(categoryType) {

	let { DutyTodo, _this, m } = this,
	    isRead = false, j = 0,
	    cb = ({hash,category}) => {
		j++;
		if ( category && Array.isArray(category) && category.includes(categoryType)) {
		    isRead = true;

		    ReadTodo.STYLE_READ(m[hash],DutyTodo);
		}

		if ( ! isRead && Object.keys(m).length === j ) {
		    return false;
		} else if ( isRead && Object.keys(m).length === j ) {
		    return true;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(_this,cb)
	    .catch( _ => {
		process.stdout.write(`no todo with such category\n`);
	    });
    }
    urgency(urgencyType) {

	let { DutyTodo, _this, m } = this;
	switch(urgencyType) {
	case "pending":break;
	case "waiting":break;
	case "tomorrow":break;
	case "later":break;
	case "today": break;
	default:
	    DutyTodo.ErrMessage(`invalid urgency type to read`);
	    return false;
	}

	let isRead = false, j = 0,
	    cb = ({hash,urgency}) => {
		j++;
		if ( urgency && Array.isArray(urgency) && urgency.includes(urgencyType) ) {
		    isRead = true;
		    ReadTodo.STYLE_READ(m[hash],DutyTodo);
		}

		if ( ! isRead && Object.keys(m).length === j ) {
		    return false;
		} else if ( isRead && Object.keys(m).length === j ) {
		    return true;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(_this,cb)
	    .catch( _ => {
		process.stdout.write(`no todo with such urgency\n`);
	    });

    }
    completed() {
	let { DutyTodo, _this, m } = this,
	    isRead = false,j = 0,
	    cb = ({completed,hash}) => {
		j++;
		if ( completed ) {
		    isRead = true;
		    ReadTodo.STYLE_READ(m[hash],DutyTodo);
		}

		if ( ! isRead && Object.keys(m).length === j ) {
		    return false;
		} else if ( isRead && Object.keys(m).length === j ) {
		    return true;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(_this,cb)
	    .catch( _ => {
		process.stdout.write(`nothing complete to read\n`);
	    });

    }
    notcompleted() {

	let { DutyTodo, _this, m } = this,
	    isRead = false,j = 0,
	    cb = ({completed,hash}) => {
		j++;
		if ( ! completed ) {
		    isRead = true;
		    ReadTodo.STYLE_READ(m[hash],DutyTodo);
		}

		if ( ! isRead && Object.keys(m).length === j ) {
		    return false;
		} else if ( isRead && Object.keys(m).length === j ) {
		    return true;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(_this,cb)
	    .catch( _ => {
		process.stdout.write(`nothing complete to read\n`);
	    });

    }
    date() {
	let { DutyTodo, _this, m } = this,
	    { date: _userDate , modifiedDate: _userModifiedDate} = this._opt,
	    isRead = false,j = 0,
	    cb = ({date,modifiedDate,hash}) => {
		j++;
		if ( (_userDate && date === _userDate) && (_userModifiedDate && modifiedDate === _userModifiedDate)
		   ) {
		    isRead = true;
		    ReadTodo.STYLE_READ(m[hash],DutyTodo);
		} else if ( (_userDate && date === _userDate) && !_userModifiedDate ) {
		    isRead = true;
		    ReadTodo.STYLE_READ(m[hash],DutyTodo);
		}

		if ( ! isRead && Object.keys(m).length === j ) {
		    return false;
		} else if ( isRead && Object.keys(m).length === j ) {
		    return true;
		}
	    };

	DutyTodo.CALLGENERATORYLOOP(_this,cb)
	    .catch( _ => {
		process.stdout.write(`no match for the specified date was found\n`);
	    });
    }


}
module.exports = ReadTodo;
